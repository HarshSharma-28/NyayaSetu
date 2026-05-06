from typing import List, dict

class DepartmentRouter:
    """
    Routes legal directives to the responsible government departments based on keyword matching.
    India-specific, covering common administrative domains.
    """
    
    ROUTING_RULES = {
        "Finance": [
            "dues", "salary", "pay", "arrears", "compensation",
            "payment", "amount", "funds", "disburse", "pension",
            "grant", "financial", "budget", "reimbursement",
            "honorarium", "stipend", "allowance"
        ],
        "HR": [
            "reinstate", "reinstatement", "employee", "service",
            "promotion", "transfer", "dismissal", "termination",
            "appointment", "seniority", "regularize", "cadre",
            "recruitment", "increment", "deputation", "posting"
        ],
        "Revenue": [
            "land", "property", "survey", "mutation", "khasra",
            "patta", "acquisition", "encroachment", "namuaber",
            "tehsildar", "patwari", "collector", "khatauni",
            "registry", "stamp duty", "zameen", "plot", "khatian"
        ],
        "Legal Cell": [
            "appeal", "contempt", "supreme court", "high court",
            "slp", "petition", "counter affidavit", "compliance report",
            "vakalatnama", "rejoinder", "caveat", "court fee",
            "writ", "review petition", "limitation period"
        ],
        "Public Works": [
            "road", "construction", "infrastructure", "building",
            "demolish", "structure", "drainage", "water supply",
            "sewage", "bridge", "maintenance", "repair",
            "encroachment removal", "noc", "building permission"
        ],
        "Health": [
            "hospital", "medical", "health", "treatment",
            "doctor", "patient", "medicine", "healthcare",
            "ambulance", "dispensary", "phc", "cmho"
        ],
        "Education": [
            "school", "college", "university", "student",
            "teacher", "admission", "examination", "degree",
            "rte", "scholarship", "hostel", "vice chancellor"
        ],
        "Social Welfare": [
            "sc", "st", "obc", "disability", "widow", "orphan",
            "bpl", "ration", "pds", "anganwadi", "welfare",
            "beneficiary", "tribal", "minority"
        ],
    }
    
    def route(self, directive_text: str) -> List[dict]:
        """
        Analyzes directive text and returns the top 2 matched departments with confidence scores.
        Defaults to 'Legal Cell' if no keywords match.
        """
        text_lower = directive_text.lower()
        scores: dict[str, dict] = {}
        
        for dept, keywords in self.ROUTING_RULES.items():
            matched = [kw for kw in keywords if kw in text_lower]
            if matched:
                scores[dept] = {
                    "department": dept,
                    "score": len(matched),
                    "matched_keywords": matched
                }
        
        if not scores:
            return [{
                "department": "Legal Cell",
                "score": 0,
                "matched_keywords": [],
                "reason": "Default — no department-specific keywords detected"
            }]
        
        # Sort by score (number of matched keywords) descending
        sorted_matches = sorted(
            scores.values(),
            key=lambda x: x["score"],
            reverse=True
        )
        
        return sorted_matches[:2]
