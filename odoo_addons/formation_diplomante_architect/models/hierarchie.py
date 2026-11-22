from odoo import api, fields, models, _


class FormationAnnee(models.Model):
    _name = 'formation.annee'
    _description = 'Année de formation'
    _order = 'diplome_id, sequence, id'

    name = fields.Char(string='Année', required=True)
    sequence = fields.Integer(default=10)
    diplome_id = fields.Many2one(
        'formation.diplome', string='Diplôme', required=True, ondelete='cascade', index=True,
    )
    company_id = fields.Many2one(related='diplome_id.company_id', store=True, index=True)
    semestre_ids = fields.One2many('formation.semestre', 'annee_id', string='Semestres')


class FormationSemestre(models.Model):
    _name = 'formation.semestre'
    _description = 'Semestre de formation'
    _order = 'annee_id, sequence, id'

    name = fields.Char(string='Semestre', required=True)
    sequence = fields.Integer(default=10)
    annee_id = fields.Many2one(
        'formation.annee', string='Année', required=True, ondelete='cascade', index=True,
    )
    diplome_id = fields.Many2one(related='annee_id.diplome_id', store=True, index=True)
    company_id = fields.Many2one(related='annee_id.company_id', store=True, index=True)
    matiere_ids = fields.One2many('formation.matiere', 'semestre_id', string='Matières')

    @api.depends('name', 'annee_id.name')
    def _compute_display_name(self):
        for rec in self:
            rec.display_name = ' / '.join(filter(None, [rec.annee_id.name, rec.name]))


class FormationIaMixin(models.AbstractModel):
    """Bouton « Générer les micro-compétences » partagé par les matières et les chapitres."""

    _name = 'formation.ia.mixin'
    _description = 'Génération IA de micro-compétences'

    def _ia_source_text(self):
        raise NotImplementedError

    def _ia_target_chapitre(self):
        raise NotImplementedError

    def action_generer_micro_competences(self):
        self.ensure_one()
        items = self.env['formation.llm.service'].generate_micro_competences(
            self.diplome_id, self._ia_source_text(),
        )
        chapitre = self._ia_target_chapitre()
        existing = {m.name.strip().lower() for m in chapitre.micro_competence_ids}
        vals_list = [
            {
                'name': item['name'],
                'description': item['description'] or False,
                'niveau': item['niveau'],
                'chapitre_id': chapitre.id,
                'statut_validation': 'brouillon',
                'generee_par_ia': True,
            }
            for item in items
            if item['name'].strip().lower() not in existing
        ]
        created = self.env['formation.micro_competence'].create(vals_list)
        return {
            'type': 'ir.actions.act_window',
            'name': _('Micro-compétences générées (à valider)'),
            'res_model': 'formation.micro_competence',
            'view_mode': 'list,form',
            'domain': [('id', 'in', created.ids)],
        }


class FormationMatiere(models.Model):
    _name = 'formation.matiere'
    _description = 'Matière / bloc de compétences'
    _inherit = ['formation.ia.mixin']
    _order = 'semestre_id, sequence, id'

    name = fields.Char(string='Matière', required=True)
    sequence = fields.Integer(default=10)
    code_bloc = fields.Char(string='Code du bloc', help="Code du bloc de compétences dans le référentiel (ex. RNCP35185BC01).")
    semestre_id = fields.Many2one(
        'formation.semestre', string='Semestre', required=True, ondelete='cascade', index=True,
    )
    diplome_id = fields.Many2one(related='semestre_id.diplome_id', store=True, index=True)
    company_id = fields.Many2one(related='semestre_id.company_id', store=True, index=True)
    coefficient = fields.Float(string='Coefficient', default=1.0)
    volume_horaire = fields.Float(string='Volume horaire (h)')
    description = fields.Text(
        string='Bloc de compétences (texte)',
        help="Texte officiel du bloc : c'est lui que l'IA découpe en micro-compétences.",
    )
    chapitre_ids = fields.One2many('formation.chapitre', 'matiere_id', string='Chapitres')
    micro_competence_ids = fields.One2many(
        'formation.micro_competence', 'matiere_id', string='Micro-compétences', readonly=True,
    )
    micro_competence_count = fields.Integer(compute='_compute_micro_competence_count')

    @api.depends('micro_competence_ids')
    def _compute_micro_competence_count(self):
        for rec in self:
            rec.micro_competence_count = len(rec.micro_competence_ids)

    def _ia_source_text(self):
        self.ensure_one()
        parts = [_("Bloc de compétences : %s", self.name)]
        if self.description:
            parts.append(self.description)
        if self.chapitre_ids:
            parts.append(_("Chapitres : %s", ', '.join(self.chapitre_ids.mapped('name'))))
        return '\n\n'.join(parts)

    def _ia_target_chapitre(self):
        """Les micro-compétences générées depuis une matière vont dans son premier chapitre (créé au besoin)."""
        self.ensure_one()
        return self.chapitre_ids[:1] or self.env['formation.chapitre'].create({
            'name': self.name, 'matiere_id': self.id,
        })


class FormationChapitre(models.Model):
    _name = 'formation.chapitre'
    _description = 'Chapitre'
    _inherit = ['formation.ia.mixin']
    _order = 'matiere_id, ordre, id'

    name = fields.Char(string='Chapitre', required=True)
    ordre = fields.Integer(string='Ordre', default=10)
    matiere_id = fields.Many2one(
        'formation.matiere', string='Matière', required=True, ondelete='cascade', index=True,
    )
    diplome_id = fields.Many2one(related='matiere_id.diplome_id', store=True, index=True)
    company_id = fields.Many2one(related='matiere_id.company_id', store=True, index=True)
    description = fields.Text(string='Contenu / compétences visées')
    micro_competence_ids = fields.One2many(
        'formation.micro_competence', 'chapitre_id', string='Micro-compétences',
    )

    def _ia_source_text(self):
        self.ensure_one()
        parts = [
            _("Bloc de compétences : %s", self.matiere_id.name),
            _("Chapitre : %s", self.name),
        ]
        if self.description:
            parts.append(self.description)
        elif self.matiere_id.description:
            parts.append(self.matiere_id.description)
        return '\n\n'.join(parts)

    def _ia_target_chapitre(self):
        self.ensure_one()
        return self
