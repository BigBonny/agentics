from odoo import fields, models, _
from odoo.exceptions import UserError

from ..utils.parsing import parse_blocs_text


class FormationImportBlocsWizard(models.TransientModel):
    """Saisie manuelle des blocs de compétences (repli quand l'API RNCP n'est pas disponible)."""

    _name = 'formation.import.blocs.wizard'
    _description = 'Saisie manuelle des blocs de compétences'

    diplome_id = fields.Many2one('formation.diplome', string='Diplôme', required=True)
    semestre_id = fields.Many2one(
        'formation.semestre', string='Semestre cible',
        domain="[('diplome_id', '=', diplome_id)]",
        help="Laissez vide pour utiliser le premier semestre (créé automatiquement si besoin).",
    )
    blocs_text = fields.Text(
        string='Blocs de compétences', required=True,
        help="Un bloc par ligne : « Intitulé », « CODE | Intitulé » ou « CODE | Intitulé | Description ».",
    )

    def action_import(self):
        self.ensure_one()
        blocs = parse_blocs_text(self.blocs_text)
        if not blocs:
            raise UserError(_("Aucun bloc à importer : saisissez un bloc par ligne."))
        matieres = self.diplome_id._create_matieres_from_blocs(blocs, self.semestre_id or None)
        self.diplome_id.message_post(body=_(
            "Saisie manuelle : %(found)s bloc(s), %(created)s matière(s) créée(s).",
            found=len(blocs), created=len(matieres),
        ))
        return {'type': 'ir.actions.act_window_close'}
