from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class OfElearningRecord(models.Model):
    """Formation complétée sur Agentics, remontée automatiquement via l'API.

    Le contrat d'API (utilisé par lib/qualisoft.ts côté Agentics) :
      - clé d'idempotence : external_ref (= training_records.id Supabase, unique)
      - recherche de l'apprenant : res.partner par email (=ilike)
      - écriture : search_read sur external_ref puis write, sinon create
    """

    _name = 'of.elearning.record'
    _description = 'Formation complétée (Agentics)'
    _inherit = ['mail.thread', 'mail.activity.mixin']
    _order = 'completed_at desc'
    _rec_name = 'display_name'

    external_ref = fields.Char(
        string='Référence externe',
        required=True,
        index=True,
        copy=False,
        help="Identifiant training_records côté Agentics (Supabase). Garantit l'idempotence.",
    )
    source = fields.Char(string='Source', default='agentics', readonly=True)

    partner_id = fields.Many2one(
        'res.partner',
        string='Apprenant',
        required=True,
        index=True,
        tracking=True,
        ondelete='restrict',
    )
    learner_email = fields.Char(string='Email apprenant', index=True)

    formation_code = fields.Char(
        string='Code formation',
        index=True,
        help="Code de la formation QualiSoft (correspondance renseignée côté Agentics).",
    )
    course_title = fields.Char(string='Intitulé du cours Agentics')

    score = fields.Float(string='Score (%)', digits=(5, 2), tracking=True)
    completed_at = fields.Datetime(string='Date de complétion', required=True, tracking=True)
    certificate_url = fields.Char(string='Lien du certificat')

    display_name = fields.Char(compute='_compute_display_name', store=True)

    _external_ref_unique = models.Constraint(
        'unique(external_ref)',
        "Cette formation a déjà été remontée (external_ref doit être unique).",
    )

    @api.depends('partner_id', 'course_title', 'completed_at')
    def _compute_display_name(self):
        for rec in self:
            parts = [rec.partner_id.display_name or rec.learner_email or '?']
            if rec.course_title:
                parts.append(rec.course_title)
            if rec.completed_at:
                parts.append(rec.completed_at.strftime('%d/%m/%Y'))
            rec.display_name = ' — '.join(parts)

    @api.constrains('score')
    def _check_score(self):
        for rec in self:
            if rec.score and not (0 <= rec.score <= 100):
                raise ValidationError(_("Le score doit être compris entre 0 et 100."))
