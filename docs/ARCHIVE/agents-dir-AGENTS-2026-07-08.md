
## 🎨 The Atelier UI Framework (nota. Aesthetic)
Whenever building or modifying User Interfaces in nota. Hub, you MUST strictly adhere to the "perfumery's workshop" aesthetic:

1. **Tactile Primitives:** Never use generic colored divs for warnings, insights, or tooltips. You MUST use the `PostItNote.tsx` and `SketchAnnotation.tsx` components.
2. **Handwritten Personalization:** Empty states, hints, and system intelligence should always feel like personalized notes written for the user. Utilize the `Caveat` font (via existing Tailwind utility classes) for these elements.
3. **Organic Layouts (Moodboard):** Avoid rigid, perfect grids for fragrance cards. Default to staggered, masonry, or offset layouts using slight CSS transforms (`rotate()`, offset margins) to mimic pinned polaroids and a physical workspace. Use the `/modern-web-guidance` principles (CSS Grid/Subgrid) to handle these offsets robustly.
4. **Materials:** Rely exclusively on the global CSS tokens (`ink`, `clay`, `brass`, `smoked-glass`) and ensure the global paper texture is preserved.

