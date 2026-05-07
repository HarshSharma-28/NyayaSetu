from datetime import date, datetime, timedelta
from dateutil.relativedelta import relativedelta
import re
from typing import Dict, Optional

class TimelineResolver:
    """
    Converts fuzzy legal language (e.g., 'within four weeks') to exact calendar dates.
    Uses pattern matching for common legal timeline expressions.
    """
    
    # Priority patterns for regex matching
    PATTERNS = [
        (r'(\d+)\s*weeks?', 'weeks'),
        (r'(\d+)\s*months?', 'months'),
        (r'(\d+)\s*days?', 'days'),
        (r'(\d+)\s*years?', 'years'),
        (r'forty[\s-]five|45\s*days', 'days_45'),
        (r'thirty|30\s*days', 'days_30'),
        (r'forthwith|immediately', 'immediate'),
        (r'expeditiously', 'expeditious'),
        (r'as early as possible', 'expeditious'),
        (r'next hearing', 'hearing'),
        (r'specific date: (\d{4}-\d{2}-\d{2})', 'exact_date'),
    ]

    def resolve(self, timeline_raw: str, order_date: date) -> dict:
        """
        Parses raw timeline text and calculates the due date relative to the order date.
        
        Returns:
        {
          "due_date": str | None,
          "days_remaining": int | None,
          "priority": str,
          "calculation_note": str,
          "requires_manual_review": bool,
          "alert_color": str
        }
        """
        if not timeline_raw:
            return self._manual_review("No timeline provided in document")

        text = timeline_raw.lower().strip()
        today = date.today()
        
        for pattern, unit in self.PATTERNS:
            match = re.search(pattern, text)
            if match:
                due = self._calculate(match, unit, order_date)
                
                if due is None:
                    return self._manual_review("Linked to hearing date — check court calendar")
                
                days_remaining = (due - today).days
                priority = self._priority(days_remaining)
                
                return {
                    "due_date": due.isoformat(),
                    "days_remaining": days_remaining,
                    "priority": priority,
                    "calculation_note": f"Calculated from order date ({order_date}) + '{timeline_raw}'",
                    "requires_manual_review": False,
                    "alert_color": self._color(priority)
                }
        
        return self._manual_review(f"Pattern not recognized: '{timeline_raw}'")

    def resolve_deadline(self, timeline_raw: str, order_date: Optional[date] = None) -> Optional[date]:
        """Returns a concrete due date (or None) for backwards compatibility."""
        if order_date is None:
            order_date = date.today()

        result = self.resolve(timeline_raw, order_date)
        due_str = result.get("due_date")
        if not due_str:
            return None

        try:
            return datetime.strptime(due_str, "%Y-%m-%d").date()
        except ValueError:
            return None
    
    def _calculate(self, match, unit: str, order_date: date) -> Optional[date]:
        """Performs the actual date arithmetic based on the matched unit."""
        if unit == 'immediate':
            return order_date + timedelta(days=3)
        if unit == 'expeditious':
            return order_date + timedelta(days=30)
        if unit == 'hearing':
            return None
        if unit == 'days_30':
            return order_date + timedelta(days=30)
        if unit == 'days_45':
            return order_date + timedelta(days=45)
        if unit == 'exact_date':
            try:
                return datetime.strptime(match.group(1), '%Y-%m-%d').date()
            except:
                return None
        
        try:
            n = int(match.group(1))
            if unit == 'days':   return order_date + timedelta(days=n)
            if unit == 'weeks':  return order_date + timedelta(weeks=n)
            if unit == 'months': return order_date + relativedelta(months=n)
            if unit == 'years':  return order_date + relativedelta(years=n)
        except:
            return None
            
        return None
    
    def _priority(self, days: int) -> str:
        """Determines compliance priority based on remaining time."""
        if days < 0:   return 'OVERDUE'
        if days <= 7:  return 'CRITICAL'
        if days <= 21: return 'HIGH'
        if days <= 60: return 'MEDIUM'
        return 'LOW'
    
    def _color(self, priority: str) -> str:
        """Returns the branding color associated with the priority level."""
        return {
            'OVERDUE':  '#ef4444',
            'CRITICAL': '#f97316',
            'HIGH':     '#d97706',
            'MEDIUM':   '#2563eb',
            'LOW':      '#16a34a',
        }.get(priority, '#6b7280')
    
    def _manual_review(self, note: str) -> dict:
        """Fallback for fuzzy timelines that cannot be automatically resolved."""
        return {
            "due_date": None,
            "days_remaining": None,
            "priority": "MEDIUM",
            "calculation_note": note,
            "requires_manual_review": True,
            "alert_color": "#6b7280"
        }
