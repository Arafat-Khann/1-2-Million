# KisanSense

AI-powered farm decision support for small farmers in Pakistan.

KisanSense provides crop-aware weather advisories, indicative irrigation estimates, market-price prototype cards, and on-device leaf screening for supported tomato and potato classes.

## Disclosure

- Gemini and Canva were used for the logo.
- ChatGPT was used for instructions.
- VS Code with Copilot was used for the frontend.
- Vercel is used for deployment.
- Supabase handles the backend and authentication.
- Supabase is connected to the project and Vercel.
- Gemini was used for sample data.
- Google Colab was used for machine-learning training.
- Kaggle was used for the dataset.

## Dataset samples

![PlantVillage samples: the 13 tomato and potato classes used in CropGuard](docs/plantvillage_samples_grid.png)

The leaf-disease model is trained on 13 tomato and potato classes from the PlantVillage dataset: 10 tomato classes and 3 potato classes, each including healthy leaves. Our training copy came from Kaggle and may be a slightly different version of the same source. The dataset's Hugging Face card lists the licence as CC BY-SA 3.0, so check the licence terms before reusing the images. If you use this dataset, please cite: Mohanty, S. P., Hughes, D. P., and Salathé, M. (2016), "Using deep learning for image-based plant disease detection", *Frontiers in Plant Science*, 7, doi:10.3389/fpls.2016.01419.

## Safety and scope

KisanSense is decision support, not a confirmed diagnosis service or an official warning service. Leaf results are screening results only. Weather and irrigation information are advisory estimates; check field conditions and local agriculture guidance before acting.

## Development

```bash
npm install
npm run dev
```

Create a local `.env.local` file with the Supabase project URL and publishable key:

```text
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-publishable-key
```
