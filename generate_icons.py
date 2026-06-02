from PIL import Image, ImageDraw, ImageFont
import os
import math

def draw_pehchan_icon(size):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    s = size
    cx = s // 2
    cy = int(s * 0.42)
    
    # Background
    radius = int(s * 0.18)
    draw.rounded_rectangle([0, 0, s-1, s-1], radius=radius, fill=(5, 5, 8, 255))
    
    # Outer ring
    ring_r = int(s * 0.26)
    draw.ellipse([cx-ring_r, cy-ring_r, cx+ring_r, cy+ring_r], 
                 outline=(0, 229, 255, 60), width=max(1, s//80))
    
    # Corner accents
    acc = int(s * 0.08)
    pad = int(s * 0.12)
    lw = max(2, s//40)
    # Top left
    draw.line([(pad, pad+acc), (pad, pad), (pad+acc, pad)], fill=(0, 229, 255, 255), width=lw)
    # Top right
    draw.line([(s-pad-acc, pad), (s-pad, pad), (s-pad, pad+acc)], fill=(0, 229, 255, 255), width=lw)
    # Bottom left
    draw.line([(pad, s-pad-acc), (pad, s-pad), (pad+acc, s-pad)], fill=(0, 229, 255, 255), width=lw)
    # Bottom right
    draw.line([(s-pad-acc, s-pad), (s-pad, s-pad), (s-pad, s-pad-acc)], fill=(0, 229, 255, 255), width=lw)
    
    # Eye shape (lens)
    eye_w = int(s * 0.52)
    eye_h = int(s * 0.28)
    draw.ellipse([cx-eye_w//2, cy-eye_h//2, cx+eye_w//2, cy+eye_h//2],
                 fill=(10, 22, 40, 255), outline=(0, 229, 255, 200), width=max(1, s//60))
    
    # Iris
    iris_r = int(s * 0.11)
    draw.ellipse([cx-iris_r, cy-iris_r, cx+iris_r, cy+iris_r],
                 fill=(5, 21, 37, 255), outline=(0, 229, 255, 200), width=max(1, s//80))
    
    # Pupil
    pupil_r = int(s * 0.075)
    draw.ellipse([cx-pupil_r, cy-pupil_r, cx+pupil_r, cy+pupil_r],
                 fill=(0, 200, 230, 220))
    
    # Pupil center
    center_r = int(s * 0.04)
    draw.ellipse([cx-center_r, cy-center_r, cx+center_r, cy+center_r],
                 fill=(5, 5, 8, 255))
    
    # Highlight
    hl_x = cx + int(s * 0.02)
    hl_y = cy - int(s * 0.02)
    hl_r = int(s * 0.015)
    draw.ellipse([hl_x-hl_r, hl_y-hl_r, hl_x+hl_r, hl_y+hl_r],
                 fill=(255, 255, 255, 180))
    
    # Text PEHCHAN
    text_y = int(s * 0.72)
    font_size = int(s * 0.13)
    try:
        font = ImageFont.truetype("arial.ttf", font_size)
    except:
        try:
            font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", font_size)
        except:
            font = ImageFont.load_default()
    
    text = "PEHCHAN"
    bbox = draw.textbbox((0, 0), text, font=font)
    text_w = bbox[2] - bbox[0]
    draw.text((cx - text_w//2, text_y), text, fill=(255, 255, 255, 255), font=font)
    
    # Cyan line under text
    line_y = text_y + font_size + int(s * 0.02)
    line_w = int(s * 0.25)
    draw.rectangle([cx-line_w//2, line_y, cx+line_w//2, line_y+max(1,s//80)],
                   fill=(0, 229, 255, 180))
    
    return img

# Icon sizes for each mipmap folder
sizes = {
    'mipmap-mdpi': 48,
    'mipmap-hdpi': 72,
    'mipmap-xhdpi': 96,
    'mipmap-xxhdpi': 144,
    'mipmap-xxxhdpi': 192,
}

base_path = r'android\app\src\main\res'

for folder, size in sizes.items():
    icon = draw_pehchan_icon(size)
    
    # Regular icon
    path = os.path.join(base_path, folder, 'ic_launcher.png')
    icon.save(path, 'PNG')
    
    # Round icon
    round_icon = draw_pehchan_icon(size)
    # Make it circular
    mask = Image.new('L', (size, size), 0)
    mask_draw = ImageDraw.Draw(mask)
    mask_draw.ellipse([0, 0, size-1, size-1], fill=255)
    round_icon.putalpha(mask)
    
    round_path = os.path.join(base_path, folder, 'ic_launcher_round.png')
    round_icon.save(round_path, 'PNG')
    
    print(f'Generated {folder}: {size}x{size}')

print('All icons generated!')