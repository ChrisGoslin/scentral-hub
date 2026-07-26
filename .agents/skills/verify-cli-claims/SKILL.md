# metadata
name: verify-cli-claims
description: Enforces that structural or logic claims made by the agent are backed by compiled verification and tests.
# instructions
When you propose a new UI component or logic flow, you MUST prove it builds successfully.
1. Claims without proof do not count. 
2. Before stating "The component is complete," run a silent build/lint check against the Next.js/Tailwind environment.
3. Verify strict adherence to the performance brand budget: Assert that the rendered DOM contains ≤3 liquid glass backdrop filters and exactly one fixed grain layer.
4. If the build breaks, or if the CSS relies on hardcoded hexes instead of `DESIGN.md` tokens, you must reject your own output and silently rewrite it.
