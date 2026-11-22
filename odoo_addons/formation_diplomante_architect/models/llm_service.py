import logging

import requests

from odoo import api, models, _
from odoo.exceptions import UserError

from ..utils.parsing import parse_micro_competences

_logger = logging.getLogger(__name__)

PARAM_PREFIX = 'formation_diplomante_architect.'

DEFAULT_SYSTEM_PROMPT = (
    "Tu es un ingénieur pédagogique. À partir du bloc de compétences suivant (texte), "
    "génère une liste de micro-compétences évaluables. Chaque micro-compétence doit être "
    "formulée avec un verbe d'action observable, un objet et une condition. "
    "Retourne un JSON avec les champs : nom, description, niveau."
)

# Ajouté à tout prompt (y compris personnalisé) pour garantir un format lisible par le module.
FORMAT_INSTRUCTIONS = (
    "\n\nFormat de réponse obligatoire : uniquement un objet JSON, sans texte autour, de la forme "
    '{"micro_competences": [{"nom": "...", "description": "...", "niveau": "Débutant|Intermédiaire|Avancé"}]}.'
)

# Modèles économiques par défaut (modifiable dans les paramètres).
PROVIDERS = {
    'openai': {'base_url': 'https://api.openai.com/v1', 'model': 'gpt-4o-mini'},
    'mistral': {'base_url': 'https://api.mistral.ai/v1', 'model': 'mistral-small-latest'},
    'anthropic': {'base_url': 'https://api.anthropic.com/v1', 'model': 'claude-haiku-5-5'},
}
TIMEOUT = 90


class FormationLlmService(models.AbstractModel):
    """Appels au fournisseur LLM configuré dans les paramètres système."""

    _name = 'formation.llm.service'
    _description = 'Service LLM (découpage en micro-compétences)'

    @api.model
    def _get_config(self):
        icp = self.env['ir.config_parameter'].sudo()
        provider = icp.get_param(PARAM_PREFIX + 'llm_provider') or 'openai'
        if provider not in PROVIDERS:
            raise UserError(_("Fournisseur LLM inconnu : %s", provider))
        return {
            'provider': provider,
            'api_key': icp.get_param(PARAM_PREFIX + 'llm_api_key') or '',
            'model': icp.get_param(PARAM_PREFIX + 'llm_model') or PROVIDERS[provider]['model'],
            'base_url': (icp.get_param(PARAM_PREFIX + 'llm_base_url') or PROVIDERS[provider]['base_url']).rstrip('/'),
        }

    @api.model
    def _call_llm(self, system_prompt, user_text):
        """Envoie le prompt et renvoie le texte brut de la réponse."""
        config = self._get_config()
        if not config['api_key']:
            raise UserError(_(
                "Aucune clé API LLM n'est configurée. Un responsable doit la renseigner dans "
                "Paramètres → Formation Architect."
            ))
        try:
            if config['provider'] == 'anthropic':
                response = requests.post(
                    config['base_url'] + '/messages',
                    headers={
                        'x-api-key': config['api_key'],
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json',
                    },
                    json={
                        'model': config['model'],
                        'max_tokens': 4096,
                        'system': system_prompt,
                        'messages': [{'role': 'user', 'content': user_text}],
                    },
                    timeout=TIMEOUT,
                )
                response.raise_for_status()
                blocks = response.json().get('content') or []
                return ''.join(b.get('text', '') for b in blocks if b.get('type') == 'text')

            # OpenAI et Mistral partagent le format /chat/completions
            response = requests.post(
                config['base_url'] + '/chat/completions',
                headers={
                    'Authorization': 'Bearer ' + config['api_key'],
                    'Content-Type': 'application/json',
                },
                json={
                    'model': config['model'],
                    'temperature': 0.2,
                    'messages': [
                        {'role': 'system', 'content': system_prompt},
                        {'role': 'user', 'content': user_text},
                    ],
                },
                timeout=TIMEOUT,
            )
            response.raise_for_status()
            return response.json()['choices'][0]['message']['content'] or ''
        except requests.HTTPError as error:
            status = error.response.status_code if error.response is not None else '?'
            _logger.warning("Appel LLM %s refusé (HTTP %s)", config['provider'], status)
            raise UserError(_(
                "Le fournisseur LLM (%(provider)s) a refusé la requête (HTTP %(status)s). "
                "Vérifiez la clé API, le modèle et le quota du compte.",
                provider=config['provider'], status=status,
            )) from error
        except (requests.RequestException, KeyError, IndexError, ValueError) as error:
            _logger.warning("Appel LLM %s en échec : %s", config['provider'], error)
            raise UserError(_("Le fournisseur LLM est injoignable ou a renvoyé une réponse illisible.")) from error

    @api.model
    def generate_micro_competences(self, diplome, texte):
        """Découpe `texte` en micro-compétences. Renvoie une liste de dicts {name, description, niveau}.

        Chaque appel est compté sur le diplôme (suivi des coûts).
        """
        if not (texte or '').strip():
            raise UserError(_("Aucun texte à découper : renseignez l'intitulé ou la description du bloc."))
        system_prompt = ((diplome.prompt_systeme or '').strip() or DEFAULT_SYSTEM_PROMPT) + FORMAT_INSTRUCTIONS
        raw = self._call_llm(system_prompt, texte)
        diplome._register_llm_call()
        try:
            return parse_micro_competences(raw)
        except ValueError as error:
            raise UserError(_(
                "La réponse de l'IA n'a pas pu être lue (%s). Relancez la génération ou ajustez le prompt du diplôme.",
                error,
            )) from error
