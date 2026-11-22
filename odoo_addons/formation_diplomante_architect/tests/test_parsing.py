"""Tests des fonctions pures. Exécutables aussi sans Odoo :

    python tests/test_parsing.py
"""
import importlib.util
import os
import unittest

try:
    from ..utils import parsing
except ImportError:  # exécution directe, hors Odoo
    _path = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'utils', 'parsing.py')
    _spec = importlib.util.spec_from_file_location('fda_parsing', _path)
    parsing = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(parsing)


class TestParseMicroCompetences(unittest.TestCase):

    def test_objet_avec_liste(self):
        raw = '{"micro_competences": [{"nom": "Configurer un routeur", "description": "d", "niveau": "Avancé"}]}'
        self.assertEqual(parsing.parse_micro_competences(raw), [
            {'name': 'Configurer un routeur', 'description': 'd', 'niveau': 'avance'},
        ])

    def test_tableau_dans_bloc_markdown(self):
        raw = 'Voici le résultat :\n```json\n[{"nom": "A", "niveau": "débutant"}, {"name": "B"}]\n```'
        result = parsing.parse_micro_competences(raw)
        self.assertEqual([r['name'] for r in result], ['A', 'B'])
        self.assertEqual([r['niveau'] for r in result], ['debutant', 'intermediaire'])

    def test_texte_autour_du_json(self):
        raw = 'Bien sûr ! {"items": [{"nom": "A", "niveau": "Intermédiaire"}]} Bonne journée.'
        self.assertEqual(parsing.parse_micro_competences(raw)[0]['niveau'], 'intermediaire')

    def test_entrees_sans_nom_ignorees(self):
        raw = '[{"description": "sans nom"}, {"nom": "  "}, {"nom": "Valide"}, 42]'
        self.assertEqual([r['name'] for r in parsing.parse_micro_competences(raw)], ['Valide'])

    def test_reponse_illisible(self):
        for raw in ('', 'désolé, je ne peux pas', '{"micro_competences": []}', '[{"description": "x"}]'):
            with self.assertRaises(ValueError):
                parsing.parse_micro_competences(raw)


class TestExtractBlocs(unittest.TestCase):

    def test_liste_sous_cle_bloc(self):
        data = {'data': [{
            'intitule': 'BTS SIO',
            'voies': [{'libelle': 'Apprentissage'}],
            'blocs_competences': [
                {'code': 'RNCP35185BC01', 'intitule': 'Support'},
                {'code': 'RNCP35185BC02', 'libelle': 'Réseau', 'competences': ['a', 'b']},
            ],
        }]}
        self.assertEqual(parsing.extract_blocs(data), [
            {'code': 'RNCP35185BC01', 'name': 'Support', 'description': ''},
            {'code': 'RNCP35185BC02', 'name': 'Réseau', 'description': 'a\nb'},
        ])

    def test_blocs_imbriques(self):
        data = {'blocs_competences': {'rncp': [{'code': 'BC01', 'intitule': 'Bloc 1'}]}}
        self.assertEqual([b['name'] for b in parsing.extract_blocs(data)], ['Bloc 1'])

    def test_rien_a_extraire(self):
        self.assertEqual(parsing.extract_blocs({'message': 'not found'}), [])
        self.assertEqual(parsing.extract_blocs([]), [])

    def test_meta(self):
        data = {'data': [{'intitule': 'BTS SIO', 'niveau_europeen': 'NIV5', 'certificateurs': [{'nom': 'MESR'}]}]}
        self.assertEqual(parsing.extract_diplome_meta(data), {
            'name': 'BTS SIO', 'niveau_europeen': '5', 'certificateur': 'MESR',
        })
        self.assertEqual(parsing.extract_diplome_meta('texte'), {})


class TestParseBlocsText(unittest.TestCase):

    def test_formats(self):
        text = "Bloc simple\n\nBC02 | Réseau\n BC03 | Cybersécurité | Protéger | les données \n | \n"
        self.assertEqual(parsing.parse_blocs_text(text), [
            {'code': '', 'name': 'Bloc simple', 'description': ''},
            {'code': 'BC02', 'name': 'Réseau', 'description': ''},
            {'code': 'BC03', 'name': 'Cybersécurité', 'description': 'Protéger | les données'},
        ])
        self.assertEqual(parsing.parse_blocs_text(''), [])


if __name__ == '__main__':
    unittest.main()
