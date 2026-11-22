from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    fda_llm_provider = fields.Selection(
        [('openai', 'OpenAI'), ('mistral', 'Mistral'), ('anthropic', 'Anthropic')],
        string='Fournisseur LLM', default='openai',
        config_parameter='formation_diplomante_architect.llm_provider',
    )
    fda_llm_api_key = fields.Char(
        string='Clé API LLM', config_parameter='formation_diplomante_architect.llm_api_key',
    )
    fda_llm_model = fields.Char(
        string='Modèle LLM', config_parameter='formation_diplomante_architect.llm_model',
        help="Laissez vide pour le modèle économique par défaut du fournisseur.",
    )
    fda_llm_quota_defaut = fields.Integer(
        string="Quota d'appels IA par diplôme (défaut)",
        config_parameter='formation_diplomante_architect.llm_quota_defaut',
        help="Appliqué aux nouveaux diplômes. 0 = pas de limite.",
    )
    fda_rncp_endpoint = fields.Char(
        string='Endpoint API RNCP', config_parameter='formation_diplomante_architect.rncp_endpoint',
        help="URL de l'API. Utilisez {code} à l'endroit du code RNCP ; sinon le code est ajouté à la fin.",
    )
    fda_rncp_api_key = fields.Char(
        string='Clé API RNCP', config_parameter='formation_diplomante_architect.rncp_api_key',
    )
    fda_qualisoft_api_key = fields.Char(
        string='Clé API Qualisoft (API REST sortante)',
        config_parameter='formation_diplomante_architect.qualisoft_api_key',
        help="Jeton que Qualisoft (ou le RAG) doit envoyer pour lire /api/v1/…",
    )
