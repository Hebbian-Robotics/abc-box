# ABC Box — bill of materials and build notes

A proposed tabletop workcell using supplier-cut metric extrusions, three outside-mounted wall panels, one worktop, two arm-base locations and a single camera mast. Dimensions are in millimetres unless stated otherwise.

The reference equipment is an OpenYAM-style bimanual arrangement. Measure the actual arm bases, camera mount and support table before fabrication. This is a spatial construction proposal, not a verified robot-load rating or final manufacturing drawing.

## Dimensions

| Feature | Size |
|---|---|
| Bare frame | 1370 wide × 935 deep × 1280 high |
| Exterior including 10 mm wall panels | 1390 wide × 945 deep × 1280 high |
| Between wall planes | 1370 wide × 935 deep |
| Arm-base centres | 620 apart; 252.5 from the open-front datum |
| Arm beam top and worktop | 30 above the support table |
| Camera optical centre | 954.32053 above the arm-base plane; 166.49488 toward the opening from the arm-base line |
| Camera viewing direction | 30 degrees toward the workspace from vertically downward |

Frame rails occupy 30 mm strips inside the walls at their heights. Clamps and the camera foot extend beyond the listed frame envelope. Compared with ABC's simulation, the walls are 80 mm farther apart and the back wall is 40 mm farther back; arm-base and camera target positions follow the reference geometry.

## Extrusions and brackets

[Download main MISUMI CSV](misumi-compact-purchase.csv). Map the two columns to part number and quantity in the supplier's import form. The final number on each extrusion SKU is the supplied cut length. No home extrusion cutting, end tapping or wrench-access machining is specified.

| Part number | Quantity | Purpose |
|---|---:|---|
| GFS6-3030-1280 | 4 | Corner posts |
| GFS6-3030-1310 | 2 | Rear rails between posts |
| GFS6-3030-875 | 4 | Side rails between posts |
| GFS6-3030-1000 | 1 | Adjustable camera mast |
| GFS6-3030-300 | 1 | Camera mast foot |
| GFS6-3030-100 | 1 | Camera offset |
| HFS6-3090-1300 | 1 | Shared arm-support beam |
| HBLFSN6 | 18 | 12 enclosure brackets + 6 camera-support brackets |

Total: **14 extrusions, 13.94 m**, plus **18 bare brackets**. The 3030 profiles are silver clear-anodized GFS6 high-rigidity extrusions. The 3090 beam is clear-anodized HFS6, laid flat with its 90 mm face on top. Brackets are bare parts, without bundled screws or nuts.

Side rails butt between full-height posts: 875 + 30 + 30 = 935 mm outside depth. Rear rails similarly give 1310 + 30 + 30 = 1370 mm outside width. Camera-support lengths provide adjustment room and are proposed construction dimensions, not measurements of ABC's physical single-mast assembly.

The [extrusions-only CSV](misumi-extrusions-upload.csv), [custom supplier quote](custom-extrusion-quote.csv) and [paste-ready TSV](misumi-quote-paste.tsv) duplicate relevant items from the main CSV. Do not add them to the same order as additional parts.

## Nuts, screws and washers

| Hardware | Required quantity | Notes |
|---|---:|---|
| HNTT6-6 Series 6 M6 T-nuts | 48 | 36 for brackets + 12 for walls; no spares or adapter allowance |
| M6 × 12 socket-head screws | 36 | MISUMI CBM6-12 reference; two per HBLFSN6 bracket |
| M6 panel screws | 12 | Length depends on final panel, washer and slot engagement |
| Load-spreading washers for M6 panel screws | 12 | Choose for actual panel material |
| Arm/camera adapter fasteners | To determine | Depends on equipment and adapter design |

[T-nut CSV](misumi-compact-optional-nuts.csv): these nuts are required by the design; the purchase is optional only when suitable nuts are already available. Ordinary hex nuts do not replace profile-specific T-nuts. Load pre-assembly nuts before closing the frame joints.

Screws and washers are not included in the CSVs. Source them separately or reuse compatible stock. For bracket screws, match the catalog head dimensions and engagement; added washers change engagement. For panels, check screw length after selecting panel material and washer thickness.

## Other parts

- **Six removable table clamps:** two for the arm beam and four for the lower frame rails. The illustrated example is [Performance Tool W3982](https://www.amazon.com/dp/B01N0OM99E), with 203.2 mm throat depth and 76.2 mm opening. The model's example table is 1600 × 1250 × 35 mm. The modeled reaches are 190 mm for arm clamps and 130 mm for frame clamps, with a 65 mm clamped stack. Recalculate for another table and any protective pads. Clamp bodies are simplified and holding capacity under robot motion has not been validated.
- **Two arm mounting plates and one camera adapter:** measure hole patterns and mounting surfaces on the actual equipment. The displayed arm mounting areas are outlines, and the camera adapter is a placeholder; there is no verified adapter SKU or machining drawing.
- **Worktop retention tape:** choose for the table and worktop material. Tape limits sliding; the table carries the worktop weight. Account for under-panel tape in the 30 mm finished work height. Walls remain bolted and the frame/arm beam remain clamped.
- **Optional end caps:** [CSV](misumi-compact-optional-caps.csv), HFC6-3030-B ×7 and HFC6-3090-B ×2. The seven 3030 caps cover four post tops, the mast top, the exposed foot end and the offset end; the two 3090 caps cover the arm-beam ends. Do not cap butt joints or table-bearing ends. Caps are not shown in the viewer.
- **Support table, arms and camera:** source separately. The example table dimensions illustrate clamp access, not a required table model.

## Panel blanks and cutouts

| Panel | Nominal blank | Quantity |
|---|---|---:|
| Side wall | 935 deep × 1280 high × 10 thick | 2 |
| Back wall | 1390 wide × 1280 high × 10 thick | 1 |
| Worktop | 1270 wide × 582.5 deep × 30 finished thickness | 1 |

Panels are separate purchases and are not included in the MISUMI CSVs. Material is not fixed by this design. A white finish can reproduce the reference appearance. A 30 mm worktop may be solid or built from layers.

Walls bolt onto the outside frame faces. Side panels end at depth 935 mm; the back panel covers both side-panel rear edges. Wall bottoms are at table level and tops are 1250 mm above the work surface. No mitered panel joints are specified.

Each side wall needs three bottom-opening cutouts. Distances are measured from that panel's front edge:

| Cutout | Start along depth | Width | Height from bottom |
|---|---:|---:|---:|
| Front frame clamp | 90 | 60 | 105 |
| Arm-beam clamp | 197.5 | 110 | 105 |
| Rear frame clamp | 720 | 60 | 105 |

Proposed side-panel fixing centres are at depths 50 and 850 mm and heights 15 and 1265 mm. Proposed back-panel fixing centres are 95 and 1295 mm from its left edge and at heights 15 and 1265 mm. All screw heads are outside. Hole diameters, material-specific edge distances and machining tolerances remain to be specified.

The worktop begins 302.5 mm from the open-front datum and ends at 885 mm. It has 50 mm gaps to the side/back wall planes and 20 mm gaps to the inward frame faces. It rests directly on the support table.

**Dry-assemble and measure the frame, table and actual clamps before final panel cutting and drilling.** These are nominal model dimensions, not tolerance-complete fabrication drawings.

## Assembly outline

1. Identify the bars and load the required pre-assembly T-nuts into their slots.
2. Join the side and rear rails between the four posts using the 12 enclosure brackets. Check squareness and the outside dimensions.
3. Position the shared arm beam and proposed camera support. Use the six camera-support brackets for the foot-to-beam, mast-to-foot and offset-to-mast joints.
4. Fit removable clamps to the support table. Check clamp access and the side-panel cutout positions against the actual hardware.
5. Measure for panels and equipment adapters. Complete material-specific hole and fastener details, then fit the outside wall panels.
6. Fit the 30 mm finished worktop and retention tape. Position the actual arm bases and camera using the reference datums, accounting for adapter thickness and the camera optical centre.

Resolve equipment adapter fit and mounting capacity before operating the arms. The arms display the official I2RT YAM v1 URDF and meshes in an illustrative joint pose. Confirm the actual robot variant and adapter thickness. This viewer does not perform collision detection or structural analysis.

## Sources

- [ABC project](https://abc.bot/), [paper, Figure 22](https://abc.bot/abc.pdf), and [public simulation scene](https://github.com/amazon-far/abc/blob/6c467cebcecf16a4dce79e6fd87a7ca2281c3ef0/abc_sim/models/yam_bimanual_empty.xml).
- [MISUMI 3030 profiles](https://us.misumi-ec.com/vona2/detail/110302686450/) and [3090 profile](https://us.misumi-ec.com/vona2/detail/110302687670/).
- [HBLFSN6 bracket](https://us.misumi-ec.com/vona2/detail/110300442340/) and [catalog drawing](https://us.misumi-ec.com/pdf/fa/2019/2019_US_2734.pdf).
- [HNTT6-6 nut](https://us.misumi-ec.com/vona2/detail/110302251050?HissuCode=HNTT6-6) and [Series 6 caps](https://us.misumi-ec.com/vona2/detail/110300446540/).

Supplier links are specification references, not current quotes or delivery guarantees. Recheck specifications and availability when ordering. No panels, adapters or load-rated completed assembly are implied by the extrusion BOM.
