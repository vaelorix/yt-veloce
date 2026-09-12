import math
from PIL import Image, ImageDraw

def create_icon(size=512):
    img = Image.new('RGBA', (size, size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    scale = size / 48.0
    
    def pt(x, y):
        return (x * scale, y * scale)
    
    def pts(coords):
        return [pt(x, y) for x, y in coords]
    
    # Outer hexagon
    hex_coords = [(24, 3), (41, 12.8), (41, 35.2), (24, 45), (7, 35.2), (7, 12.8)]
    draw.polygon(pts(hex_coords), fill=(13, 17, 23, 255), outline=(46, 160, 67, 255), width=int(2.5 * scale))
    
    # Stream 1
    stream1 = [(13, 16.5), (21, 21.5), (16, 24.5), (10, 20.5)]
    draw.polygon(pts(stream1), fill=(126, 231, 135, 220))
    
    # Stream 2
    stream2 = [(10, 27.5), (16, 23.5), (21, 26.5), (13, 31.5)]
    draw.polygon(pts(stream2), fill=(35, 134, 54, 220))
    
    # Main chevron arrow
    arrow = [(20, 14), (37, 24), (20, 34), (20, 28), (29, 24), (20, 20)]
    draw.polygon(pts(arrow), fill=(46, 160, 67, 255))
    
    # Inner white accent
    inner = [(22, 20.5), (30, 24), (22, 27.5)]
    draw.polygon(pts(inner), fill=(255, 255, 255, 240))
    
    # Bottom indicator dot
    dot_center = pt(24, 41)
    r = 1.8 * scale
    draw.ellipse([dot_center[0] - r, dot_center[1] - r, dot_center[0] + r, dot_center[1] + r], fill=(86, 211, 100, 255))
    
    return img

if __name__ == '__main__':
    base_512 = create_icon(512)
    base_512.save('desktop/resources/icon.png', 'PNG')
    
    # Save multi-size ICO for Windows
    sizes = [(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)]
    base_512.save('desktop/resources/icon.ico', format='ICO', sizes=sizes)
    print("Created icon.png and icon.ico successfully!")
