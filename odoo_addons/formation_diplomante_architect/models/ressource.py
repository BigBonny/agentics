from odoo import api, fields, models, _
from odoo.exceptions import ValidationError


class FormationRessourceTag(models.Model):
    _name = 'formation.ressource.tag'
    _description = 'Tag de ressource'
    _order = 'name'

    name = fields.Char(required=True)
    color = fields.Integer(string='Couleur')

    _tag_name_unique = models.Constraint('unique(name)', "Ce tag existe déjà.")


class FormationRessource(models.Model):
    _name = 'formation.ressource'
    _description = 'Ressource documentaire'
    _order = 'micro_competence_id, id'

    name = fields.Char(string='Titre', required=True)
    micro_competence_id = fields.Many2one(
        'formation.micro_competence', string='Micro-compétence', required=True, ondelete='cascade', index=True,
    )
    diplome_id = fields.Many2one(related='micro_competence_id.diplome_id', store=True, index=True)
    company_id = fields.Many2one(related='micro_competence_id.company_id', store=True, index=True)
    type = fields.Selection(
        [('document', 'Document'), ('lien', 'Lien'), ('video', 'Vidéo')],
        string='Type', required=True, default='document',
    )
    fichier = fields.Binary(string='Fichier', attachment=True)
    fichier_nom = fields.Char(string='Nom du fichier')
    url = fields.Char(string='URL')
    description = fields.Text(string='Description')
    tag_ids = fields.Many2many('formation.ressource.tag', string='Tags')

    # Lien avec le RAG : la base vectorielle externe lit les ressources via l'API
    # puis signale celles qu'elle a indexées.
    statut_indexation = fields.Selection(
        [('non_indexe', 'Non indexé'), ('indexe', 'Indexé')],
        string='Indexation RAG', default='non_indexe', required=True, copy=False, index=True,
    )
    date_indexation = fields.Datetime(string='Indexé le', readonly=True, copy=False)

    @api.constrains('type', 'url')
    def _check_url(self):
        for rec in self:
            if rec.type == 'lien' and not rec.url:
                raise ValidationError(_("Une ressource de type « Lien » doit avoir une URL."))
            if rec.url and not rec.url.lower().startswith(('http://', 'https://')):
                raise ValidationError(_("L'URL doit commencer par http:// ou https://"))

    def write(self, vals):
        # Un contenu modifié doit être réindexé.
        if {'fichier', 'url'} & set(vals) and 'statut_indexation' not in vals:
            vals = dict(vals, statut_indexation='non_indexe', date_indexation=False)
        return super().write(vals)

    def action_marquer_indexe(self):
        self.write({'statut_indexation': 'indexe', 'date_indexation': fields.Datetime.now()})

    def action_marquer_non_indexe(self):
        self.write({'statut_indexation': 'non_indexe', 'date_indexation': False})
