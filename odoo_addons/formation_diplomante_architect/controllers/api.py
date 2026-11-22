"""API REST sortante (Qualisoft + indexation RAG).

Authentification : jeton stocké dans le paramètre système
`formation_diplomante_architect.qualisoft_api_key`, envoyé dans l'en-tête
`Authorization: Bearer <jeton>` ou `X-API-Key: <jeton>`. Réponses en JSON.

Par défaut, seules les micro-compétences validées par un humain sont exposées
(`?inclure_non_validees=1` pour tout obtenir).
"""
import base64
import hmac

from odoo import http
from odoo.http import request

PARAM_KEY = 'formation_diplomante_architect.qualisoft_api_key'


def _truthy(value):
    return str(value or '').lower() in ('1', 'true', 'yes', 'oui')


def _selection_label(record, field_name):
    value = record[field_name]
    return dict(record._fields[field_name]._description_selection(record.env)).get(value) if value else None


class FormationArchitectApi(http.Controller):

    # ------------------------------------------------------------------
    # Outils
    # ------------------------------------------------------------------
    def _error(self, status, message):
        return request.make_json_response({'error': message}, status=status)

    def _check_token(self):
        """Renvoie une réponse d'erreur si le jeton est absent ou faux, sinon None."""
        expected = request.env['ir.config_parameter'].sudo().get_param(PARAM_KEY) or ''
        if not expected:
            return self._error(503, "API désactivée : aucune clé API n'est configurée dans Odoo.")
        header = request.httprequest.headers.get('Authorization', '')
        token = header[7:].strip() if header.lower().startswith('bearer ') else ''
        token = token or request.httprequest.headers.get('X-API-Key', '').strip()
        if not token or not hmac.compare_digest(token.encode(), expected.encode()):
            return self._error(401, "Clé API absente ou invalide.")
        return None

    def _diplome_vals(self, d):
        return {
            'id': d.id,
            'name': d.name,
            'code_rncp': d.code_rncp or None,
            'code_cfd': d.code_cfd or None,
            'niveau_europeen': int(d.niveau_europeen) if d.niveau_europeen else None,
            'certificateur': d.certificateur or None,
            'statut': d.statut,
            'source': d.source,
            'nb_matieres': d.matiere_count,
            'nb_micro_competences_validees': d.micro_competence_valide_count,
            'write_date': d.write_date and d.write_date.isoformat(),
        }

    def _micro_vals(self, m, detail=False):
        vals = {
            'id': m.id,
            'name': m.name,
            'description': m.description or None,
            'niveau': m.niveau,
            'niveau_label': _selection_label(m, 'niveau'),
            'statut_validation': m.statut_validation,
        }
        if detail:
            vals.update({
                'chapitre': {'id': m.chapitre_id.id, 'name': m.chapitre_id.name},
                'matiere': {'id': m.matiere_id.id, 'name': m.matiere_id.name},
                'diplome': {'id': m.diplome_id.id, 'name': m.diplome_id.name, 'code_rncp': m.diplome_id.code_rncp or None},
                'methodes_evaluation': [
                    {
                        'id': e.id,
                        'type': e.type,
                        'type_label': _selection_label(e, 'type'),
                        'critere_reussite': e.critere_reussite or None,
                        'duree_estimee': e.duree_estimee,
                        'ponderation': e.ponderation,
                    }
                    for e in m.methode_evaluation_ids
                ],
                'ressources': [self._ressource_vals(r) for r in m.ressource_ids],
            })
        return vals

    def _ressource_vals(self, r):
        return {
            'id': r.id,
            'name': r.name,
            'type': r.type,
            'url': r.url or None,
            'description': r.description or None,
            'tags': r.tag_ids.mapped('name'),
            'fichier_nom': r.fichier_nom or None,
            'fichier_url': '/api/v1/ressources/%s/fichier' % r.id if r.fichier else None,
            'statut_indexation': r.statut_indexation,
            'micro_competence_id': r.micro_competence_id.id,
            'write_date': r.write_date and r.write_date.isoformat(),
        }

    # ------------------------------------------------------------------
    # Diplômes
    # ------------------------------------------------------------------
    @http.route('/api/v1/diplomes', type='http', auth='public', methods=['GET'], csrf=False)
    def diplomes(self, **params):
        denied = self._check_token()
        if denied:
            return denied
        domain = []
        if params.get('statut') in ('brouillon', 'valide'):
            domain.append(('statut', '=', params['statut']))
        if params.get('code_rncp'):
            domain.append(('code_rncp', '=', params['code_rncp'].strip().upper()))
        diplomes = request.env['formation.diplome'].sudo().search(domain)
        return request.make_json_response({'diplomes': [self._diplome_vals(d) for d in diplomes]})

    @http.route('/api/v1/diplomes/<int:diplome_id>/structure', type='http', auth='public', methods=['GET'], csrf=False)
    def diplome_structure(self, diplome_id, **params):
        denied = self._check_token()
        if denied:
            return denied
        diplome = request.env['formation.diplome'].sudo().browse(diplome_id).exists()
        if not diplome:
            return self._error(404, "Diplôme introuvable.")
        include_all = _truthy(params.get('inclure_non_validees'))

        def micros(chapitre):
            records = chapitre.micro_competence_ids
            if not include_all:
                records = records.filtered(lambda m: m.statut_validation == 'valide')
            return [self._micro_vals(m) for m in records]

        structure = dict(self._diplome_vals(diplome), annees=[
            {
                'id': annee.id,
                'name': annee.name,
                'semestres': [
                    {
                        'id': semestre.id,
                        'name': semestre.name,
                        'matieres': [
                            {
                                'id': matiere.id,
                                'name': matiere.name,
                                'code_bloc': matiere.code_bloc or None,
                                'coefficient': matiere.coefficient,
                                'volume_horaire': matiere.volume_horaire,
                                'chapitres': [
                                    {
                                        'id': chapitre.id,
                                        'name': chapitre.name,
                                        'ordre': chapitre.ordre,
                                        'micro_competences': micros(chapitre),
                                    }
                                    for chapitre in matiere.chapitre_ids
                                ],
                            }
                            for matiere in semestre.matiere_ids
                        ],
                    }
                    for semestre in annee.semestre_ids
                ],
            }
            for annee in diplome.annee_ids
        ])
        return request.make_json_response(structure)

    # ------------------------------------------------------------------
    # Micro-compétences
    # ------------------------------------------------------------------
    @http.route('/api/v1/micro-competences/<int:micro_id>', type='http', auth='public', methods=['GET'], csrf=False)
    def micro_competence(self, micro_id, **params):
        denied = self._check_token()
        if denied:
            return denied
        micro = request.env['formation.micro_competence'].sudo().browse(micro_id).exists()
        if not micro or (micro.statut_validation != 'valide' and not _truthy(params.get('inclure_non_validees'))):
            return self._error(404, "Micro-compétence introuvable ou non validée.")
        return request.make_json_response(self._micro_vals(micro, detail=True))

    # ------------------------------------------------------------------
    # Ressources (extraction pour la base vectorielle / RAG)
    # ------------------------------------------------------------------
    @http.route('/api/v1/ressources', type='http', auth='public', methods=['GET'], csrf=False)
    def ressources(self, **params):
        denied = self._check_token()
        if denied:
            return denied
        domain = []
        if params.get('statut_indexation') in ('non_indexe', 'indexe'):
            domain.append(('statut_indexation', '=', params['statut_indexation']))
        if str(params.get('diplome_id') or '').isdigit():
            domain.append(('diplome_id', '=', int(params['diplome_id'])))
        if not _truthy(params.get('inclure_non_validees')):
            domain.append(('micro_competence_id.statut_validation', '=', 'valide'))
        ressources = request.env['formation.ressource'].sudo().search(domain)
        return request.make_json_response({'ressources': [self._ressource_vals(r) for r in ressources]})

    @http.route('/api/v1/ressources/<int:ressource_id>/fichier', type='http', auth='public', methods=['GET'], csrf=False)
    def ressource_fichier(self, ressource_id, **params):
        denied = self._check_token()
        if denied:
            return denied
        ressource = request.env['formation.ressource'].sudo().browse(ressource_id).exists()
        if not ressource or not ressource.fichier:
            return self._error(404, "Fichier introuvable.")
        content = base64.b64decode(ressource.fichier)
        filename = (ressource.fichier_nom or 'ressource-%s' % ressource.id).replace('"', '')
        return request.make_response(content, headers=[
            ('Content-Type', 'application/octet-stream'),
            ('Content-Disposition', http.content_disposition(filename)),
            ('Content-Length', str(len(content))),
        ])

    @http.route('/api/v1/ressources/<int:ressource_id>/indexation', type='http', auth='public', methods=['POST'], csrf=False)
    def ressource_indexation(self, ressource_id, **params):
        """Le RAG signale qu'une ressource est indexée (`statut=indexe`, défaut) ou à réindexer (`statut=non_indexe`)."""
        denied = self._check_token()
        if denied:
            return denied
        ressource = request.env['formation.ressource'].sudo().browse(ressource_id).exists()
        if not ressource:
            return self._error(404, "Ressource introuvable.")
        if params.get('statut') == 'non_indexe':
            ressource.action_marquer_non_indexe()
        else:
            ressource.action_marquer_indexe()
        return request.make_json_response(self._ressource_vals(ressource))
