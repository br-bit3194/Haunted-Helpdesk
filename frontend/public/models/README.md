# 3D Models Directory

## Setup Instructions

Please copy the following GLB files from the `3d_model` directory to this directory:

1. `base_basic_pbr.glb` - PBR (Physically Based Rendering) model with realistic materials
2. `base_basic_shaded.glb` - Basic shaded model for better performance

### Manual Copy Commands

**Windows (PowerShell):**
```powershell
Copy-Item "..\..\..\..\3d_model\base_basic_pbr.glb" "."
Copy-Item "..\..\..\..\3d_model\base_basic_shaded.glb" "."
```

**Windows (CMD):**
```cmd
copy ..\..\..\..\3d_model\base_basic_pbr.glb .
copy ..\..\..\..\3d_model\base_basic_shaded.glb .
```

**Linux/Mac:**
```bash
cp ../../../../3d_model/base_basic_pbr.glb .
cp ../../../../3d_model/base_basic_shaded.glb .
```

## Model Information

- **Format**: GLB (Binary glTF)
- **Recommended for Production**: `base_basic_shaded.glb` (better performance)
- **High Quality Option**: `base_basic_pbr.glb` (more realistic rendering)
