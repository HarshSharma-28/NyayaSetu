from typing import List, Dict

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

    DEPT_MAP = {
        "Finance": "1ba0ea6c-7dff-4c88-a33c-7ef4c6a0b8a1",
        "HR": "019cf500-e820-4f02-b763-91cd62c849f4",
        "Revenue": "2398f890-186f-4777-a4d0-41a99c34540d",
        "Legal Cell": "2cba4c79-dd07-4b08-a495-368e192645af",
        "Public Works": "d7d3f9c1-e0b6-44c9-a2fb-f2c795b295e3",
        "Health": "a694196b-6ab9-49a3-8290-943124b8af38",
        "Education": "85a90a13-74ff-4417-9f1d-0f9d84d4d453",
        "Social Welfare": "40f45359-3687-4ace-80db-7120ade21a20"
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
        
    def route_directive(self, text: str, hint: str = None) -> str:
        """
        Syntactic sugar for cases.py - returns the top department's UUID.
        """
        matches = self.route(text)
        top_dept_name = matches[0]["department"]
        
        if hint and any(m["department"].lower() == hint.lower() for m in matches):
            top_dept_name = hint
            
        # Return the UUID from our map
        return self.DEPT_MAP.get(top_dept_name, self.DEPT_MAP["Legal Cell"])
