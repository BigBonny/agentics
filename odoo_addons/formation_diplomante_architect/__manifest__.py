{
    'name': 'Formation Diplomante Architect',
    'version': '19.0.1.0.0',
    'category': 'eLearning',
    'summary': "Conception et découpage de formations diplômantes (RNCP → micro-compétences)",
    'description': """
Structure une formation diplômante ou certifiante à partir de son référentiel
officiel (RNCP / France Compétences) :

* hiérarchie Diplôme > Année > Semestre > Matière > Chapitre > Micro-compétence ;
* import des blocs de compétences (API RNCP ou saisie manuelle) ;
* découpage assisté par IA (OpenAI, Mistral, Anthropic) avec validation humaine ;
* méthodologies d'évaluation et ressources documentaires par micro-compétence ;
* API REST (clé API) pour Qualisoft et pour l'indexation RAG.
""",
    'author': 'ISBE',
    'license': 'LGPL-3',
    'depends': ['base', 'mail'],
    'external_dependencies': {'python': ['requests']},
    'data': [
        'security/security.xml',
        'security/ir.model.access.csv',
        'wizard/import_blocs_wizard_views.xml',
        'views/micro_competence_views.xml',
        'views/hierarchie_views.xml',
        'views/diplome_views.xml',
        'views/ressource_views.xml',
        'views/res_config_settings_views.xml',
        'views/menus.xml',
    ],
    'demo': [
        'demo/bts_sio_demo.xml',
    ],
    'installable': True,
    'application': True,
}
