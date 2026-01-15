from app.models.repository import Repository
import re

def get_real_repo_name(repo: Repository) -> str:
    """
    Extracts the real 'owner/repo' string from a Repository object.
    Prioritizes parsing 'html_url' because 'full_name' might be constructed with numeric IDs.
    """
    # Try to extract "owner/repo" from html_url: https://github.com/owner/repo
    if repo.html_url:
        try:
            # Regex to capture owner/repo from github.com/owner/repo
            match = re.search(r"github\.com/([^/]+)/([^/]+)", repo.html_url)
            if match:
                return f"{match.group(1)}/{match.group(2)}"
        except Exception:
            pass 
            
    # Fallback to existing full_name if parsing fails or html_url is missing
    # (Though usually full_name is the fallback, in our case full_name might be broken "123/name")
    
    # If full_name looks like "number/name", and we couldn't parse html_url, 
    # we might be in trouble, but html_url should exist for all GitHub repos.
    return repo.full_name
