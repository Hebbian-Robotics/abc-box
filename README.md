# ABC Box

[Interactive viewer](https://hebbian-robotics.github.io/abc-box/) · [Build list](public/compact-build-list.md)

An interactive 3D viewer and bill of materials for an ABC-inspired tabletop robot workcell. Inspect individual extrusions, brackets, panels and clamps; hover or select a part to see dimensions and supplier references.

This is an independent construction proposal based on public [ABC](https://abc.bot/) references. It is not an official ABC manufacturing kit. Robot sketches, camera adapters and clamp shapes are illustrative; adapter hole patterns and mounting loads still need verification for the equipment used.

## Design

| Feature | Dimensions |
|---|---|
| Bare extrusion frame | 1370 × 935 × 1280 mm |
| Outside panel envelope | 1390 × 945 × 1280 mm |
| Space between wall faces | 1370 × 935 mm; frame rails project 30 mm inward |
| Arm-base spacing | 620 mm |
| Worktop | 1270 × 582.5 × 30 mm finished thickness |
| Camera optical target | 954.3 mm above the arm-base plane, 166.5 mm toward the opening from the arm-base line |

The design uses 14 supplier-cut extrusions, a shared arm beam, one camera mast, outside-mounted wall panels and removable table clamps. It needs an existing support table. The camera support lengths are proposed construction dimensions; the walls are 80 mm farther apart and the back wall is 40 mm farther back than the simulation's clear wall dimensions.

## Build and buy

Start with the [build list](public/compact-build-list.md), which includes panel blanks, clamp cutouts, fasteners, assembly notes and unresolved fit details.

| Download | Contents |
|---|---|
| [Main MISUMI CSV](public/misumi-compact-purchase.csv) | 14 extrusions + 18 bare brackets |
| [Compatible T-nuts](public/misumi-compact-optional-nuts.csv) | 48 required nuts; omit purchase only if compatible nuts are already available |
| [Optional caps](public/misumi-compact-optional-caps.csv) | 7 caps for 3030 and 2 for 3090 |
| [Extrusions only](public/misumi-extrusions-upload.csv) | The same 14 bars without hardware |
| [Custom supplier quote](public/custom-extrusion-quote.csv) | Profile sizes, cut lengths and quantities |
| [Paste-ready TSV](public/misumi-quote-paste.tsv) | Same contents as the main CSV |

The main CSV, extrusions-only CSV, custom quote and TSV are alternate representations, not additive orders. Ordinary screws, washers, panels, clamps and equipment adapters are listed in the build guide but excluded from the MISUMI CSVs. Supplier references do not guarantee current price, availability or delivery dates.

## Run locally

Use Node.js 24 and pnpm 12.3.4.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open the local URL printed by Vite. Drag to orbit, scroll to zoom, or choose Front, Side and Top views. Select individual parts from the list or directly in the scene. The walls default to 75% opacity; turn off **Transparent walls** for solid panels.

```sh
pnpm format
pnpm typecheck
pnpm check
pnpm build
pnpm preview
```

## Hosting

The viewer runs entirely in the browser. The build output in `dist/` can be served by GitHub Pages, Cloudflare Pages or another static host. No backend, credentials or environment secrets are required. Assets and BOM download links use relative URLs so the same build works at a site root or repository subpath.

### GitHub Pages

In the repository's **Settings → Pages**, select **GitHub Actions** as the source. The included workflow checks and builds the project, then deploys `dist/` on pushes to `main`. Forks can enable Pages and use the same workflow without editing the repository name into the code. Pull requests run checks without deploying.

### Cloudflare Pages

Connect the repository and use:

| Setting | Value |
|---|---|
| Production branch | `main` |
| Root directory | Repository root |
| Build command | `pnpm build` |
| Build output directory | `dist` |
| `NODE_VERSION` | `24` |
| `PNPM_VERSION` | `12.3.4` |

Alternatively, build locally and upload `dist/` using Cloudflare Pages Direct Upload. GitHub Actions deployment is optional when hosting elsewhere; disable the Pages workflow if it is not used.

References: [Vite static deployment](https://vite.dev/guide/static-deploy), [Cloudflare Pages build configuration](https://developers.cloudflare.com/pages/configuration/build-configuration/).

## Project structure

- `src/layout.ts`: enclosure dimensions, in metres.
- `src/model.ts`: procedural Three.js geometry and part descriptions.
- `src/compact-bom.ts`: purchasable extrusion and hardware references.
- `src/shopping.ts`: shopping UI and model-derived received-parts export.
- `public/`: downloadable BOMs and build documentation.

Geometry and the static supplier CSVs must be kept in sync when changing the design. The scene is a spatial review tool, not machining CAD or a verified collision model.

## Sources and license

Reference geometry comes from the public [ABC simulation](https://github.com/amazon-far/abc/blob/6c467cebcecf16a4dce79e6fd87a7ca2281c3ef0/abc_sim/models/yam_bimanual_empty.xml) and the physical setup shown in [the ABC paper, Figure 22](https://abc.bot/abc.pdf). This repository contains procedural visualizations, not robot CAD or model weights. See [NOTICE](NOTICE) for attribution.

Code and documentation are available under [Apache-2.0](LICENSE). Third-party products and libraries retain their respective licenses and trademarks.
