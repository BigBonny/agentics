{
    'name': 'Agentics — Synchronisation des formations',
    'version': '19.0.1.0.0',
    'category': 'eLearning',
    'summary': "Reçoit les formations complétées sur la plateforme Agentics",
    'description': """
Enregistre dans QualiSoft/Odoo les formations complétées par les apprenants
sur la plateforme Agentics Révision (remontée automatique via l'API JSON-2).

Chaque complétion de cours côté Agentics crée ou met à jour un enregistrement
`of.elearning.record`, rattaché à l'apprenant (res.partner, identifié par email)
et à la formation (via formation_code).
""",
    'author': 'ISBE',
    'license': 'LGPL-3',
    'depends': ['base', 'mail'],
    'data': [
        'security/ir.model.access.csv',
        'views/elearning_record_views.xml',
    ],
    'installable': True,
    'application': False,
}
