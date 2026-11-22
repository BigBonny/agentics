from unittest.mock import patch

from odoo.exceptions import AccessError, UserError, ValidationError
from odoo.tests import TransactionCase, new_test_user, tagged

LLM_PATH = 'odoo.addons.formation_diplomante_architect.models.llm_service.FormationLlmService._call_llm'
LLM_ANSWER = (
    '{"micro_competences": ['
    '{"nom": "Configurer un commutateur selon un plan fourni", "description": "d1", "niveau": "Débutant"},'
    '{"nom": "Diagnostiquer une panne réseau à partir de journaux", "description": "d2", "niveau": "Avancé"}'
    ']}'
)


@tagged('post_install', '-at_install')
class TestFormation(TransactionCase):

    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.user = new_test_user(
            cls.env, login='fda_user',
            groups='formation_diplomante_architect.group_formation_architect_user',
        )
        cls.manager = new_test_user(
            cls.env, login='fda_manager',
            groups='formation_diplomante_architect.group_formation_architect_manager',
        )
        cls.diplome = cls.env['formation.diplome'].create({'name': 'BTS Test', 'code_rncp': 'RNCP00001'})

    def _matiere(self, **vals):
        semestre = self.diplome._get_default_semestre()
        return self.env['formation.matiere'].create(dict({'name': 'Réseau', 'semestre_id': semestre.id}, **vals))

    # -- Hiérarchie ---------------------------------------------------
    def test_hierarchie_et_champs_lies(self):
        matiere = self._matiere()
        chapitre = self.env['formation.chapitre'].create({'name': 'Commutation', 'matiere_id': matiere.id})
        micro = self.env['formation.micro_competence'].create({'name': 'Configurer un VLAN', 'chapitre_id': chapitre.id})
        self.assertEqual(micro.matiere_id, matiere)
        self.assertEqual(micro.diplome_id, self.diplome)
        self.assertEqual(micro.company_id, self.diplome.company_id)
        self.assertEqual(micro.statut_validation, 'brouillon')
        self.assertEqual(self.diplome.micro_competence_count, 1)
        self.assertEqual(len(self.diplome.annee_ids), 1, "Année 1 / Semestre 1 créés automatiquement")

    def test_blocs_sans_doublon(self):
        blocs = [{'code': 'BC01', 'name': 'Support'}, {'code': 'BC02', 'name': 'Réseau'}]
        self.assertEqual(len(self.diplome._create_matieres_from_blocs(blocs)), 2)
        again = self.diplome._create_matieres_from_blocs(blocs + [{'code': '', 'name': 'Cybersécurité'}])
        self.assertEqual(again.mapped('name'), ['Cybersécurité'])

    def test_wizard_saisie_manuelle(self):
        wizard = self.env['formation.import.blocs.wizard'].create({
            'diplome_id': self.diplome.id,
            'blocs_text': "BC01 | Support | Gérer le parc\nRéseau",
        })
        wizard.action_import()
        self.assertEqual(self.diplome.matiere_ids.mapped('name'), ['Support', 'Réseau'])
        self.assertEqual(self.diplome.matiere_ids[0].description, 'Gérer le parc')

    def test_import_rncp_sans_endpoint(self):
        self.env['ir.config_parameter'].sudo().set_param('formation_diplomante_architect.rncp_endpoint', '')
        with self.assertRaises(UserError):
            self.diplome.action_import_rncp()

    # -- Assistant IA -------------------------------------------------
    def test_generation_ia_depuis_matiere(self):
        matiere = self._matiere(description='Installer et configurer des équipements réseau.')
        with patch(LLM_PATH, return_value=LLM_ANSWER) as call:
            action = matiere.with_user(self.user).action_generer_micro_competences()
        self.assertIn('Installer et configurer', call.call_args[0][1])
        micros = matiere.micro_competence_ids
        self.assertEqual(len(micros), 2)
        self.assertEqual(set(micros.mapped('statut_validation')), {'brouillon'})
        self.assertTrue(all(micros.mapped('generee_par_ia')))
        self.assertEqual(sorted(micros.mapped('niveau')), ['avance', 'debutant'])
        self.assertEqual(len(matiere.chapitre_ids), 1, "chapitre créé pour accueillir les micro-compétences")
        self.assertEqual(action['domain'], [('id', 'in', micros.ids)])
        self.assertEqual(self.diplome.llm_call_count, 1)

        # Relancer ne crée pas de doublon mais compte l'appel
        with patch(LLM_PATH, return_value=LLM_ANSWER):
            matiere.action_generer_micro_competences()
        self.assertEqual(len(matiere.micro_competence_ids), 2)
        self.assertEqual(self.diplome.llm_call_count, 2)

    def test_prompt_personnalise_et_quota(self):
        self.diplome.write({'prompt_systeme': 'PROMPT MAISON', 'llm_call_quota': 1})
        chapitre = self.env['formation.chapitre'].create({'name': 'Routage', 'matiere_id': self._matiere().id})
        self.assertFalse(self.diplome.llm_quota_depasse)
        with patch(LLM_PATH, return_value=LLM_ANSWER) as call:
            chapitre.action_generer_micro_competences()
        system_prompt = call.call_args[0][0]
        self.assertTrue(system_prompt.startswith('PROMPT MAISON'))
        self.assertIn('micro_competences', system_prompt)
        self.assertTrue(self.diplome.llm_quota_depasse)
        self.assertEqual(len(chapitre.micro_competence_ids), 2)

    def test_reponse_ia_illisible(self):
        matiere = self._matiere()
        with patch(LLM_PATH, return_value='Désolé, impossible.'), self.assertRaises(UserError):
            matiere.action_generer_micro_competences()

    def test_sans_cle_api(self):
        self.env['ir.config_parameter'].sudo().set_param('formation_diplomante_architect.llm_api_key', '')
        with self.assertRaises(UserError):
            self._matiere().action_generer_micro_competences()

    # -- Validation humaine --------------------------------------------
    def test_validation_reservee_au_responsable(self):
        chapitre = self.env['formation.chapitre'].create({'name': 'C', 'matiere_id': self._matiere().id})
        micro = self.env['formation.micro_competence'].create({'name': 'M', 'chapitre_id': chapitre.id})
        with self.assertRaises(AccessError):
            micro.with_user(self.user).action_valider()
        with self.assertRaises(AccessError):
            self.env['formation.micro_competence'].with_user(self.user).create({
                'name': 'M2', 'chapitre_id': chapitre.id, 'statut_validation': 'valide',
            })
        micro.with_user(self.user).write({'description': 'modifiable par un utilisateur'})
        micro.with_user(self.manager).action_valider()
        self.assertEqual(micro.statut_validation, 'valide')
        self.assertEqual(micro.valide_par_id, self.manager)
        self.assertEqual(self.diplome.micro_competence_valide_count, 1)
        micro.with_user(self.manager).action_rejeter()
        self.assertFalse(micro.valide_par_id)

    # -- Évaluations et ressources --------------------------------------
    def test_methodes_et_ressources(self):
        chapitre = self.env['formation.chapitre'].create({'name': 'C', 'matiere_id': self._matiere().id})
        micro = self.env['formation.micro_competence'].create({'name': 'M', 'chapitre_id': chapitre.id})
        methode = self.env['formation.methode_evaluation'].create({
            'micro_competence_id': micro.id, 'type': 'qcm', 'critere_reussite': '8/10', 'ponderation': 2,
        })
        methode.action_dupliquer()
        self.assertEqual(len(micro.methode_evaluation_ids), 2)
        self.assertEqual(micro.methode_evaluation_ids.mapped('critere_reussite'), ['8/10', '8/10'])

        with self.assertRaises(ValidationError):
            self.env['formation.ressource'].create({'name': 'R', 'micro_competence_id': micro.id, 'type': 'lien'})
        ressource = self.env['formation.ressource'].create({
            'name': 'R', 'micro_competence_id': micro.id, 'type': 'lien', 'url': 'https://example.org/a',
        })
        self.assertEqual(ressource.statut_indexation, 'non_indexe')
        ressource.action_marquer_indexe()
        self.assertEqual(ressource.statut_indexation, 'indexe')
        ressource.write({'url': 'https://example.org/b'})
        self.assertEqual(ressource.statut_indexation, 'non_indexe', "contenu modifié = à réindexer")
