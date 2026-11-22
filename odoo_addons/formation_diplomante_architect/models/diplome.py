import logging
from urllib.parse import quote

import requests

from odoo import api, fields, models, _
from odoo.exceptions import UserError

from ..utils.parsing import extract_blocs, extract_diplome_meta
from .llm_service import DEFAULT_SYSTEM_PROMPT, PARAM_PREFIX

_logger = logging.getLogger(__name__)


class FormationDiplome(models.Model):
    _name = 'formation.diplome'
    _description = 'Diplôme / certification'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'name'

    name = fields.Char(string='Intitulé', required=True, tracking=True)
    code_rncp = fields.Char(string='Code RNCP', index=True, tracking=True, help="Ex. RNCP35185")
    code_cfd = fields.Char(string='Code CFD', help="Code formation diplôme (Éducation nationale), si applicable.")
    niveau_europeen = fields.Selection(
        [(str(i), 'Niveau %s' % i) for i in range(1, 9)],
        string='Niveau européen (CEC)',
    )
    certificateur = fields.Char(string='Certificateur')
    statut = fields.Selection(
        [('brouillon', 'Brouillon'), ('valide', 'Validé')],
        string='Statut', default='brouillon', required=True, tracking=True, copy=False,
    )
    source = fields.Selection(
        [('rncp', 'RNCP'), ('manuel', 'Manuel')],
        string='Source', default='manuel', required=True,
    )
    company_id = fields.Many2one(
        'res.company', string='Société', default=lambda self: self.env.company, index=True,
    )
    active = fields.Boolean(default=True)

    annee_ids = fields.One2many('formation.annee', 'diplome_id', string='Années')
    matiere_ids = fields.One2many('formation.matiere', 'diplome_id', string='Matières', readonly=True)
    micro_competence_ids = fields.One2many(
        'formation.micro_competence', 'diplome_id', string='Micro-compétences', readonly=True,
    )
    matiere_count = fields.Integer(compute='_compute_counts', string='Nb matières')
    micro_competence_count = fields.Integer(compute='_compute_counts', string='Nb micro-compétences')
    micro_competence_valide_count = fields.Integer(compute='_compute_counts', string='Nb validées')

    # Suivi des coûts IA (risque 3 du cahier des charges)
    llm_call_count = fields.Integer(string='Appels IA effectués', readonly=True, copy=False)
    llm_call_quota = fields.Integer(
        string='Quota d\'appels IA',
        default=lambda self: self._default_llm_call_quota(),
        help="Nombre d'appels IA au-delà duquel un avertissement s'affiche. 0 = pas de limite.",
    )
    llm_quota_depasse = fields.Boolean(compute='_compute_llm_quota_depasse')
    # Mode « prompt engineering » (risque 2)
    prompt_systeme = fields.Text(
        string='Prompt système personnalisé',
        help="Laissez vide pour utiliser le prompt par défaut. Les consignes de format JSON sont ajoutées automatiquement.",
    )
    prompt_systeme_defaut = fields.Text(
        string='Prompt par défaut', compute='_compute_prompt_systeme_defaut',
    )

    @api.model
    def _default_llm_call_quota(self):
        value = self.env['ir.config_parameter'].sudo().get_param(PARAM_PREFIX + 'llm_quota_defaut')
        try:
            return int(value or 0)
        except ValueError:
            return 0

    @api.depends('matiere_ids', 'micro_competence_ids.statut_validation')
    def _compute_counts(self):
        for rec in self:
            rec.matiere_count = len(rec.matiere_ids)
            rec.micro_competence_count = len(rec.micro_competence_ids)
            rec.micro_competence_valide_count = len(
                rec.micro_competence_ids.filtered(lambda m: m.statut_validation == 'valide')
            )

    @api.depends('llm_call_count', 'llm_call_quota')
    def _compute_llm_quota_depasse(self):
        for rec in self:
            rec.llm_quota_depasse = bool(rec.llm_call_quota) and rec.llm_call_count >= rec.llm_call_quota

    def _compute_prompt_systeme_defaut(self):
        for rec in self:
            rec.prompt_systeme_defaut = DEFAULT_SYSTEM_PROMPT

    # ------------------------------------------------------------------
    # Statut
    # ------------------------------------------------------------------
    def action_valider(self):
        self.write({'statut': 'valide'})

    def action_brouillon(self):
        self.write({'statut': 'brouillon'})

    def action_view_micro_competences(self):
        self.ensure_one()
        return {
            'type': 'ir.actions.act_window',
            'name': _('Micro-compétences'),
            'res_model': 'formation.micro_competence',
            'view_mode': 'list,form',
            'domain': [('diplome_id', '=', self.id)],
            'context': {'search_default_group_matiere': 1},
        }

    # ------------------------------------------------------------------
    # Suivi IA
    # ------------------------------------------------------------------
    def _register_llm_call(self):
        """Compte un appel IA ; prévient dans le fil de discussion au franchissement du quota."""
        for rec in self.sudo():
            rec.llm_call_count += 1
            if rec.llm_call_quota and rec.llm_call_count == rec.llm_call_quota:
                rec.message_post(body=_(
                    "Quota d'appels IA atteint (%(count)s/%(quota)s). Les prochains appels restent possibles "
                    "mais augmentent le coût : vérifiez l'usage ou relevez le quota.",
                    count=rec.llm_call_count, quota=rec.llm_call_quota,
                ))

    # ------------------------------------------------------------------
    # Structure
    # ------------------------------------------------------------------
    def _get_default_semestre(self):
        """Premier semestre du diplôme ; crée « Année 1 / Semestre 1 » si la structure est vide."""
        self.ensure_one()
        semestre = self.env['formation.semestre'].search(
            [('diplome_id', '=', self.id)], order='annee_id, sequence, id', limit=1,
        )
        if semestre:
            return semestre
        annee = self.annee_ids[:1] or self.env['formation.annee'].create({
            'name': _('Année 1'), 'diplome_id': self.id,
        })
        return self.env['formation.semestre'].create({'name': _('Semestre 1'), 'annee_id': annee.id})

    def _create_matieres_from_blocs(self, blocs, semestre=None):
        """Crée une matière par bloc de compétences (sans doublon sur le code ou l'intitulé)."""
        self.ensure_one()
        semestre = semestre or self._get_default_semestre()
        existing = self.matiere_ids
        existing_codes = {m.code_bloc for m in existing if m.code_bloc}
        existing_names = {m.name.strip().lower() for m in existing}
        vals_list = []
        for bloc in blocs:
            name = (bloc.get('name') or '').strip()
            code = (bloc.get('code') or '').strip()
            if not name or (code and code in existing_codes) or name.lower() in existing_names:
                continue
            existing_names.add(name.lower())
            if code:
                existing_codes.add(code)
            vals_list.append({
                'name': name,
                'code_bloc': code or False,
                'description': bloc.get('description') or False,
                'semestre_id': semestre.id,
            })
        return self.env['formation.matiere'].create(vals_list)

    # ------------------------------------------------------------------
    # Import RNCP
    # ------------------------------------------------------------------
    def action_import_rncp(self):
        """Récupère les blocs de compétences du référentiel et les importe en matières."""
        self.ensure_one()
        code = (self.code_rncp or '').strip().upper().replace(' ', '')
        if not code:
            raise UserError(_("Renseignez d'abord le code RNCP du diplôme."))
        if code.isdigit():
            code = 'RNCP' + code

        icp = self.env['ir.config_parameter'].sudo()
        endpoint = (icp.get_param(PARAM_PREFIX + 'rncp_endpoint') or '').strip()
        if not endpoint:
            raise UserError(_(
                "Aucun endpoint d'API RNCP n'est configuré (Paramètres → Formation Architect). "
                "Vous pouvez saisir les blocs avec le bouton « Saisir les blocs manuellement »."
            ))
        url = endpoint.replace('{code}', quote(code)) if '{code}' in endpoint else endpoint.rstrip('/') + '/' + quote(code)
        headers = {'Accept': 'application/json'}
        token = icp.get_param(PARAM_PREFIX + 'rncp_api_key')
        if token:
            headers['Authorization'] = 'Bearer ' + token

        try:
            response = requests.get(url, headers=headers, timeout=30)
            response.raise_for_status()
            data = response.json()
        except (requests.RequestException, ValueError) as error:
            _logger.warning("Import RNCP %s en échec : %s", code, error)
            raise UserError(_(
                "L'API RNCP n'a pas répondu correctement pour %s. Vérifiez l'endpoint et la clé, "
                "ou saisissez les blocs manuellement.", code,
            )) from error

        blocs = extract_blocs(data)
        if not blocs:
            raise UserError(_(
                "Aucun bloc de compétences trouvé dans la réponse de l'API pour %s. "
                "Saisissez les blocs manuellement.", code,
            ))

        meta = extract_diplome_meta(data)
        vals = {'source': 'rncp', 'code_rncp': code}
        if meta.get('niveau_europeen') and not self.niveau_europeen:
            vals['niveau_europeen'] = meta['niveau_europeen']
        if meta.get('certificateur') and not self.certificateur:
            vals['certificateur'] = meta['certificateur']
        self.write(vals)

        matieres = self._create_matieres_from_blocs(blocs)
        self.message_post(body=_(
            "Import RNCP %(code)s : %(found)s bloc(s) trouvé(s), %(created)s matière(s) créée(s).",
            code=code, found=len(blocs), created=len(matieres),
        ))
        return {
            'type': 'ir.actions.client',
            'tag': 'display_notification',
            'params': {
                'title': _('Import RNCP'),
                'message': _("%s matière(s) créée(s) à partir du référentiel.", len(matieres)),
                'type': 'success',
                'next': {'type': 'ir.actions.client', 'tag': 'soft_reload'},
            },
        }
