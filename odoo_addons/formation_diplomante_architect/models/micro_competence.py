from odoo import api, fields, models, _
from odoo.exceptions import AccessError

MANAGER_GROUP = 'formation_diplomante_architect.group_formation_architect_manager'


class FormationMicroCompetence(models.Model):
    _name = 'formation.micro_competence'
    _description = 'Micro-compétence'
    _inherit = ['mail.thread']
    _order = 'chapitre_id, sequence, id'

    name = fields.Char(
        string='Micro-compétence', required=True, tracking=True,
        help="Formulation avec un verbe d'action observable, un objet et une condition.",
    )
    sequence = fields.Integer(default=10)
    description = fields.Text(string='Description')
    niveau = fields.Selection(
        [('debutant', 'Débutant'), ('intermediaire', 'Intermédiaire'), ('avance', 'Avancé')],
        string='Niveau', default='intermediaire', required=True,
    )
    statut_validation = fields.Selection(
        [('brouillon', 'Brouillon'), ('valide', 'Validé par humain'), ('rejete', 'Rejeté')],
        string='Validation', default='brouillon', required=True, tracking=True, copy=False, index=True,
    )
    valide_par_id = fields.Many2one('res.users', string='Validé par', readonly=True, copy=False)
    date_validation = fields.Datetime(string='Date de validation', readonly=True, copy=False)
    generee_par_ia = fields.Boolean(string='Générée par IA', readonly=True)

    chapitre_id = fields.Many2one(
        'formation.chapitre', string='Chapitre', required=True, ondelete='cascade', index=True,
    )
    matiere_id = fields.Many2one(related='chapitre_id.matiere_id', store=True, index=True)
    diplome_id = fields.Many2one(related='chapitre_id.diplome_id', store=True, index=True)
    company_id = fields.Many2one(related='chapitre_id.company_id', store=True, index=True)

    methode_evaluation_ids = fields.One2many(
        'formation.methode_evaluation', 'micro_competence_id', string="Méthodes d'évaluation", copy=True,
    )
    ressource_ids = fields.One2many(
        'formation.ressource', 'micro_competence_id', string='Ressources', copy=True,
    )

    # ------------------------------------------------------------------
    # Validation humaine obligatoire : réservée aux responsables
    # ------------------------------------------------------------------
    def _check_validation_rights(self):
        if not self.env.su and not self.env.user.has_group(MANAGER_GROUP):
            raise AccessError(_("Seul un responsable peut valider ou rejeter une micro-compétence."))

    @api.model_create_multi
    def create(self, vals_list):
        if any(vals.get('statut_validation', 'brouillon') != 'brouillon' for vals in vals_list):
            self._check_validation_rights()
        return super().create(vals_list)

    def write(self, vals):
        if 'statut_validation' in vals:
            self._check_validation_rights()
        return super().write(vals)

    def action_valider(self):
        self.write({
            'statut_validation': 'valide',
            'valide_par_id': self.env.user.id,
            'date_validation': fields.Datetime.now(),
        })

    def action_rejeter(self):
        self.write({'statut_validation': 'rejete', 'valide_par_id': False, 'date_validation': False})

    def action_brouillon(self):
        self.write({'statut_validation': 'brouillon', 'valide_par_id': False, 'date_validation': False})
