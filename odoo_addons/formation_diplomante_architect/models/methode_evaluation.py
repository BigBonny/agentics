from odoo import fields, models


class FormationMethodeEvaluation(models.Model):
    _name = 'formation.methode_evaluation'
    _description = "Méthode d'évaluation"
    _order = 'micro_competence_id, sequence, id'
    _rec_name = 'type'

    micro_competence_id = fields.Many2one(
        'formation.micro_competence', string='Micro-compétence', required=True, ondelete='cascade', index=True,
    )
    company_id = fields.Many2one(related='micro_competence_id.company_id', store=True, index=True)
    sequence = fields.Integer(default=10)
    type = fields.Selection(
        [
            ('qcm', 'QCM'),
            ('exercice', 'Exercice pratique'),
            ('etude_cas', 'Étude de cas'),
            ('oral', 'Oral'),
            ('projet', 'Projet'),
        ],
        string='Type', required=True, default='qcm',
    )
    critere_reussite = fields.Text(string='Critère de réussite')
    duree_estimee = fields.Float(string='Durée estimée (min)')
    ponderation = fields.Float(string='Pondération', default=1.0)

    def action_dupliquer(self):
        """Duplique la méthode sur la même micro-compétence (méthode « type » à adapter)."""
        for rec in self:
            rec.copy({'micro_competence_id': rec.micro_competence_id.id})
        return True
