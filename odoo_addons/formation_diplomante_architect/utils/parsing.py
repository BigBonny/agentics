"""Fonctions pures (sans dépendance Odoo) : lecture des réponses LLM et RNCP.

Gardées hors de l'ORM pour être testables sans instance Odoo.
"""
import json
import re

NIVEAUX = {
    'debutant': 'debutant', 'débutant': 'debutant', 'beginner': 'debutant', 'basique': 'debutant',
    'intermediaire': 'intermediaire', 'intermédiaire': 'intermediaire', 'intermediate': 'intermediaire',
    'avance': 'avance', 'avancé': 'avance', 'advanced': 'avance', 'expert': 'avance',
}

_TITLE_KEYS = ('intitule', 'libelle', 'intitule_bloc', 'name', 'nom', 'titre', 'title')
_CODE_KEYS = ('code', 'code_bloc', 'numero', 'id')
_DESC_KEYS = ('description', 'competences', 'liste_competences', 'contenu', 'detail')


def _strip_fences(text):
    text = (text or '').strip()
    match = re.search(r'```(?:json)?\s*(.*?)```', text, re.S)
    return match.group(1).strip() if match else text


def _loads_lenient(text):
    """json.loads, puis repli sur le premier objet/tableau JSON trouvé dans le texte."""
    text = _strip_fences(text)
    try:
        return json.loads(text)
    except (TypeError, ValueError):
        pass
    starts = [i for i in (text.find('['), text.find('{')) if i >= 0]
    if not starts:
        raise ValueError("Aucun JSON dans la réponse")
    start = min(starts)
    end = max(text.rfind(']'), text.rfind('}'))
    if end <= start:
        raise ValueError("JSON incomplet dans la réponse")
    return json.loads(text[start:end + 1])


def _first(d, keys):
    for key in keys:
        value = d.get(key)
        if value:
            return value
    return None


def _as_text(value):
    if isinstance(value, (list, tuple)):
        return '\n'.join(_as_text(v) for v in value if v)
    if isinstance(value, dict):
        return _as_text(_first(value, _TITLE_KEYS + _DESC_KEYS) or '')
    return str(value).strip() if value is not None else ''


def parse_micro_competences(raw):
    """Réponse brute du LLM → liste de dicts {name, description, niveau}.

    Accepte un tableau JSON ou un objet contenant un tableau, des clés en
    français ou en anglais, et des blocs ```json. Lève ValueError si rien
    d'exploitable.
    """
    data = _loads_lenient(raw)
    if isinstance(data, dict):
        lists = [v for v in data.values() if isinstance(v, list)]
        data = lists[0] if lists else [data]
    if not isinstance(data, list):
        raise ValueError("Le JSON ne contient pas de liste de micro-compétences")

    result = []
    for item in data:
        if isinstance(item, str):
            item = {'nom': item}
        if not isinstance(item, dict):
            continue
        name = _as_text(_first(item, ('nom', 'name', 'intitule', 'titre', 'title')))
        if not name:
            continue
        niveau_raw = _as_text(item.get('niveau') or item.get('level') or '').lower()
        result.append({
            'name': name[:500],
            'description': _as_text(item.get('description') or ''),
            'niveau': NIVEAUX.get(niveau_raw, 'intermediaire'),
        })
    if not result:
        raise ValueError("Aucune micro-compétence exploitable dans la réponse")
    return result


def _looks_like_bloc_list(value):
    return (
        isinstance(value, list) and bool(value)
        and all(isinstance(v, dict) and _first(v, _TITLE_KEYS) for v in value)
    )


def _find_bloc_lists(node, under_bloc_key=False):
    """Parcourt le JSON et renvoie [(prioritaire, liste)] des listes ressemblant à des blocs."""
    found = []
    if isinstance(node, dict):
        for key, value in node.items():
            is_bloc_key = under_bloc_key or 'bloc' in str(key).lower()
            if _looks_like_bloc_list(value):
                found.append((is_bloc_key, value))
            found.extend(_find_bloc_lists(value, is_bloc_key))
    elif isinstance(node, list):
        for value in node:
            found.extend(_find_bloc_lists(value, under_bloc_key))
    return found


def extract_blocs(data):
    """Réponse JSON d'une API RNCP → liste de dicts {code, name, description}.

    Le format exact dépend du fournisseur : on cherche la première liste
    d'objets portant un intitulé, de préférence sous une clé contenant « bloc ».
    """
    candidates = _find_bloc_lists(data)
    if not candidates and _looks_like_bloc_list(data):
        candidates = [(False, data)]
    if not candidates:
        return []
    candidates.sort(key=lambda c: (not c[0], -len(c[1])))
    blocs = []
    for item in candidates[0][1]:
        blocs.append({
            'code': _as_text(_first(item, _CODE_KEYS) or ''),
            'name': _as_text(_first(item, _TITLE_KEYS)),
            'description': _as_text(_first(item, _DESC_KEYS) or ''),
        })
    return blocs


def extract_diplome_meta(data):
    """Métadonnées du diplôme si l'API les fournit (intitulé, niveau, certificateur)."""
    if isinstance(data, dict) and isinstance(data.get('data'), dict):
        data = data['data']
    elif isinstance(data, dict) and isinstance(data.get('data'), list) and data['data']:
        data = data['data'][0]
    elif isinstance(data, list) and data:
        data = data[0]
    if not isinstance(data, dict):
        return {}

    meta = {}
    intitule = data.get('intitule') or data.get('libelle') or data.get('intitule_certification')
    if isinstance(intitule, (str, int)) and str(intitule).strip():
        meta['name'] = str(intitule).strip()
    niveau = data.get('niveau_europeen') or data.get('nomenclature_europe_niveau') or data.get('niveau')
    digits = re.search(r'[1-8]', _as_text(niveau)) if niveau else None
    if digits:
        meta['niveau_europeen'] = digits.group(0)
    certif = data.get('certificateurs') or data.get('certificateur')
    if isinstance(certif, list):
        certif = ', '.join(filter(None, (_as_text(c) for c in certif)))
    if certif:
        meta['certificateur'] = _as_text(certif)[:250]
    return meta


def parse_blocs_text(text):
    """Saisie manuelle : une ligne par bloc.

    Formats acceptés : « Intitulé », « CODE | Intitulé » ou
    « CODE | Intitulé | Description ».
    """
    blocs = []
    for line in (text or '').splitlines():
        parts = [p.strip() for p in line.split('|')]
        if not any(parts):
            continue
        if len(parts) == 1:
            code, name, description = '', parts[0], ''
        elif len(parts) == 2:
            code, name, description = parts[0], parts[1], ''
        else:
            code, name, description = parts[0], parts[1], ' | '.join(parts[2:])
        if name:
            blocs.append({'code': code, 'name': name, 'description': description})
    return blocs
