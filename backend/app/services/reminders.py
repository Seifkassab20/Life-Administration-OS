import datetime
from typing import List, Dict, Any, Optional

def compute_document_status(
    confidence_score: float,
    user_confirmed: bool,
    expiry_date: Optional[datetime.date] = None,
    due_date: Optional[datetime.date] = None
) -> str:
    """
    Computes visual status badge for document:
    - 'needs_review': low AI confidence or pending user confirmation
    - 'expired': past expiration or due date
    - 'attention_soon': expires within 30 days
    - 'safe': expires in > 30 days or no upcoming deadline
    """
    if not user_confirmed and confidence_score < 0.70:
        return "needs_review"

    target_date = expiry_date or due_date
    if not target_date:
        return "safe"

    today = datetime.date.today()
    days_left = (target_date - today).days

    if days_left < 0:
        return "expired"
    elif days_left <= 30:
        return "attention_soon"
    else:
        return "safe"

def generate_automatic_reminders(
    user_id: str,
    document_id: str,
    document_title: str,
    target_date: datetime.date,
    reminder_type: str = "expiration"
) -> List[Dict[str, Any]]:
    """
    Generates standard reminders at 30 days, 7 days, and 1 day before target date.
    """
    reminders = []
    intervals = [
        (30, "30 days before"),
        (7, "7 days before"),
        (1, "1 day before")
    ]

    for days_before, label in intervals:
        rem_date = target_date - datetime.timedelta(days=days_before)
        reminders.append({
            "user_id": user_id,
            "document_id": document_id,
            "title": f"{document_title} - {reminder_type.capitalize()} ({label})",
            "description": f"Your {document_title} is set to {reminder_type} on {target_date.strftime('%B %d, %Y')}.",
            "reminder_type": reminder_type,
            "target_date": target_date,
            "days_before": days_before,
            "reminder_date": rem_date,
            "is_sent": False,
            "is_dismissed": False
        })

    return reminders
