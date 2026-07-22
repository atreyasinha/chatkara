## 2024-07-22 - Form Accessibility
**Learning:** Found multiple instances where labels were visually styled to look like form labels but did not use the `htmlFor` attribute. This is bad for screen readers, and also prevents clicking the label from focusing the input.
**Action:** Added `htmlFor` and associated `id` attributes to all form labels to ensure they are explicitly linked to their inputs. I will look for this pattern moving forward.
