
import posixpath
import re
from pathlib import Path
from urllib.parse import quote, urlsplit

from fastapi import HTTPException

from app.core.config import settings


def get_media_root() -> Path:
    return Path(settings.media_root).resolve()


def resolve_media_file(relative_path: str) -> Path:
    """
    Resolve a relative media reference safely inside MEDIA_ROOT.
    Reject absolute paths, parent traversal and Windows separators.
    """
    if (
        not relative_path
        or "\\" in relative_path
        or relative_path.startswith("/")
    ):
        raise HTTPException(
            status_code=404,
            detail="Media resource not found",
        )

    root = get_media_root()
    candidate = (root / relative_path).resolve()

    if not candidate.is_relative_to(root):
        raise HTTPException(
            status_code=404,
            detail="Media resource not found",
        )

    if not candidate.is_file():
        raise HTTPException(
            status_code=404,
            detail="Media resource not found",
        )

    return candidate


def resolve_playlist_reference(
    manifest_ref: str,
    resource_uri: str,
) -> str:
    """
    Resolve a relative URI inside an HLS playlist.
    External URLs are not permitted by the local adapter.
    """
    parsed = urlsplit(resource_uri)

    if (
        parsed.scheme
        or parsed.netloc
        or parsed.path.startswith("/")
        or not parsed.path
        or "\\" in parsed.path
    ):
        raise HTTPException(
            status_code=422,
            detail="Unsupported media reference",
        )

    base_directory = posixpath.dirname(manifest_ref)

    resolved = posixpath.normpath(
        posixpath.join(base_directory, parsed.path)
    )

    if resolved == ".." or resolved.startswith("../"):
        raise HTTPException(
            status_code=404,
            detail="Media resource not found",
        )

    return resolved


def resource_url(token: str, relative_path: str) -> str:
    encoded_path = quote(relative_path, safe="/")

    return (
        f"{settings.api_public_base_url.rstrip('/')}"
        f"/api/v1/playback/{token}/resource/{encoded_path}"
    )


def rewrite_playlist(
    content: str,
    manifest_ref: str,
    token: str,
) -> str:
    """
    Rewrite HLS segment, variant-playlist and URI attribute
    references to token-protected local resource endpoints.
    """
    rewritten_lines = []

    for line in content.splitlines():
        stripped = line.strip()

        if not stripped:
            rewritten_lines.append(line)
            continue

        if stripped.startswith("#"):
            def replace_uri(match):
                original_uri = match.group(1)

                relative_path = resolve_playlist_reference(
                    manifest_ref,
                    original_uri,
                )

                url = resource_url(token, relative_path)
                return f'URI="{url}"'

            rewritten_lines.append(
                re.sub(
                    r'URI="([^"]+)"',
                    replace_uri,
                    line,
                )
            )
        else:
            relative_path = resolve_playlist_reference(
                manifest_ref,
                stripped,
            )

            rewritten_lines.append(
                resource_url(token, relative_path)
            )

    return "\n".join(rewritten_lines) + "\n"



def validate_asset_relative_path(
    manifest_ref: str,
    resource_path: str,
) -> str:
    """
    Ensure a requested media resource belongs to the directory
    assigned to the selected video asset.
    """

    # Reject invalid paths.
    if (
        not manifest_ref
        or not resource_path
        or "\\" in manifest_ref
        or "\\" in resource_path
        or "\x00" in manifest_ref
        or "\x00" in resource_path
    ):
        raise HTTPException(
            status_code=403,
            detail="Media resource access denied",
        )

    # Normalize the asset manifest path.
    normalized_manifest = posixpath.normpath(manifest_ref)

    if (
        normalized_manifest.startswith("/")
        or normalized_manifest == ".."
        or normalized_manifest.startswith("../")
    ):
        raise HTTPException(
            status_code=403,
            detail="Invalid asset manifest path",
        )

    # Extract the directory assigned to this asset.
    asset_directory = posixpath.dirname(normalized_manifest)

    # Require assets to be stored in their own directory.
    if not asset_directory or asset_directory == ".":
        raise HTTPException(
            status_code=403,
            detail="Invalid asset directory",
        )

    # Normalize the requested media resource.
    normalized_resource = posixpath.normpath(resource_path)

    if (
        normalized_resource in ("", ".", "..")
        or normalized_resource.startswith("/")
        or normalized_resource.startswith("../")
    ):
        raise HTTPException(
            status_code=403,
            detail="Media resource access denied",
        )

    # Ensure the requested resource belongs to this asset directory.
    if not normalized_resource.startswith(asset_directory + "/"):
        raise HTTPException(
            status_code=403,
            detail="Media resource access denied",
        )

    return normalized_resource
