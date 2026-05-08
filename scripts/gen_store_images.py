#!/usr/bin/env python3
"""Generate Google Play Store listing images for Tilt."""

from PIL import Image, ImageDraw, ImageFont
import os
import math

OUT = "/Users/hy/Documents/workspace/Tilt/artifacts/mobile/assets/store"
os.makedirs(OUT, exist_ok=True)

# ── Palette ──────────────────────────────────────────────────────────────────
BG       = (11, 22, 34)       # #0B1622 dark navy
PLAYER   = (0, 255, 179)      # #00FFB3 neon green
TARGET   = (0, 180, 120)
GRID_LINE= (30, 55, 80)
DIM_CELL = (18, 35, 52)
GOLD     = (255, 215, 0)
RED      = (255, 75, 75)
WHITE    = (255, 255, 255)
GREY     = (120, 140, 160)
CIRCUIT  = (20, 45, 65)

# TILT letter colors
TILT_COLORS = [
    (0, 255, 179),   # T  neon green
    (255, 215, 0),   # I  gold
    (255, 100, 80),  # L  coral
    (100, 180, 255), # T  sky blue
]

def font(size, bold=False):
    """Load a system font with fallback."""
    candidates = [
        "/System/Library/Fonts/Supplemental/Impact.ttf",
        "/System/Library/Fonts/Helvetica.ttc",
        "/System/Library/Fonts/SFNSDisplay.ttf",
        "/System/Library/Fonts/SFNSText.ttf",
    ]
    for path in candidates:
        if os.path.exists(path):
            try:
                return ImageFont.truetype(path, size)
            except Exception:
                continue
    return ImageFont.load_default()

def draw_circuit_lines(draw, w, h, density=18):
    """Draw faint circuit-board-style lines."""
    import random
    rng = random.Random(42)
    for _ in range(density):
        x = rng.randint(0, w)
        y = rng.randint(0, h)
        length = rng.randint(40, 180)
        horiz = rng.choice([True, False])
        x2, y2 = (x + length, y) if horiz else (x, y + length)
        draw.line([(x, y), (x2, y2)], fill=CIRCUIT, width=1)
        # corner dot
        draw.ellipse([x2 - 2, y2 - 2, x2 + 2, y2 + 2], fill=CIRCUIT)

def draw_tilt_title(draw, cx, cy, letter_size, spacing_extra=0):
    """Draw multicolor TILT letters centered at (cx, cy)."""
    letters = "TILT"
    f = font(letter_size, bold=True)
    # measure total width
    widths = []
    for ch in letters:
        bb = f.getbbox(ch)
        widths.append(bb[2] - bb[0])
    total_w = sum(widths) + spacing_extra * (len(letters) - 1)
    x = cx - total_w // 2
    for i, ch in enumerate(letters):
        bb = f.getbbox(ch)
        cw = bb[2] - bb[0]
        ch_h = bb[3] - bb[1]
        draw.text((x, cy - ch_h // 2 - bb[1]), ch, font=f, fill=TILT_COLORS[i])
        x += cw + spacing_extra
    return total_w

def draw_grid(draw, gx, gy, cell_size, player_idx, target_idx, flash_idx=None, gap=4):
    """Draw a 3×3 grid with player and target."""
    for i in range(9):
        row = i // 3
        col = i % 3
        x0 = gx + col * (cell_size + gap)
        y0 = gy + row * (cell_size + gap)
        x1 = x0 + cell_size
        y1 = y0 + cell_size
        radius = cell_size // 8

        if i == player_idx:
            # Player cell — filled neon green
            draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=PLAYER)
        elif i == target_idx:
            # Target cell — dark fill + neon border + corner brackets
            draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=DIM_CELL)
            draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, outline=PLAYER, width=3)
            # Corner brackets
            blen = cell_size // 5
            bw = 3
            corners = [(x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)]
            for bx, by, dx, dy in corners:
                draw.line([(bx, by), (bx + dx * blen, by)], fill=PLAYER, width=bw)
                draw.line([(bx, by), (bx, by + dy * blen)], fill=PLAYER, width=bw)
        else:
            draw.rounded_rectangle([x0, y0, x1, y1], radius=radius, fill=DIM_CELL)

def draw_timer_bar(draw, bx, by, bw, bh, ratio, radius=6):
    """Draw a timer bar (ratio 0..1)."""
    draw.rounded_rectangle([bx, by, bx + bw, by + bh], radius=radius, fill=(25, 50, 70))
    filled_w = max(radius * 2, int(bw * ratio))
    bar_color = PLAYER if ratio > 0.3 else RED
    draw.rounded_rectangle([bx, by, bx + filled_w, by + bh], radius=radius, fill=bar_color)

# ─────────────────────────────────────────────────────────────────────────────
# 1. App Icon  512 × 512
# ─────────────────────────────────────────────────────────────────────────────
def make_icon():
    W = H = 512
    img = Image.new("RGBA", (W, H), BG)
    draw = ImageDraw.Draw(img)

    draw_circuit_lines(draw, W, H, density=12)

    # Grid  (cell=88, gap=6)  total = 3*88+2*6 = 276
    cell = 88
    gap = 6
    grid_total = 3 * cell + 2 * gap
    gx = (W - grid_total) // 2
    gy = 140

    draw_grid(draw, gx, gy, cell, player_idx=4, target_idx=2, gap=gap)

    # TILT title below grid
    draw_tilt_title(draw, W // 2, gy + grid_total + 52, letter_size=68)

    img.save(f"{OUT}/icon_512.png")
    print("icon_512.png  saved")

# ─────────────────────────────────────────────────────────────────────────────
# 2. Feature Graphic  1024 × 500
# ─────────────────────────────────────────────────────────────────────────────
def make_feature():
    W, H = 1024, 500
    img = Image.new("RGBA", (W, H), BG)
    draw = ImageDraw.Draw(img)

    draw_circuit_lines(draw, W, H, density=30)

    # Left side: big TILT + subtitle
    lx = 90
    title_y = 130
    draw_tilt_title(draw, lx + 150, title_y, letter_size=110, spacing_extra=8)

    f_sub = font(26)
    draw.text((lx, title_y + 80), "THE MAZE PUZZLE", font=f_sub, fill=GREY)

    f_desc = font(20)
    lines = ["Tilt your phone.", "Reach the target.", "Beat the clock."]
    for j, line in enumerate(lines):
        draw.text((lx, title_y + 140 + j * 32), line, font=f_desc, fill=(160, 190, 210))

    # Right side: mini grid
    cell = 82
    gap = 6
    grid_total = 3 * cell + 2 * gap
    gx = W - grid_total - 80
    gy = (H - grid_total) // 2
    draw_grid(draw, gx, gy, cell, player_idx=4, target_idx=2, gap=gap)

    # Vertical divider
    div_x = W // 2 - 10
    for y in range(60, H - 60, 14):
        draw.rectangle([div_x, y, div_x + 1, y + 7], fill=CIRCUIT)

    img.save(f"{OUT}/feature_graphic_1024x500.png")
    print("feature_graphic_1024x500.png  saved")

# ─────────────────────────────────────────────────────────────────────────────
# 3. Screenshots  1080 × 1920
# ─────────────────────────────────────────────────────────────────────────────
PHONE_W, PHONE_H = 1080, 1920

def _phone_base():
    img = Image.new("RGBA", (PHONE_W, PHONE_H), BG)
    draw = ImageDraw.Draw(img)
    draw_circuit_lines(draw, PHONE_W, PHONE_H, density=40)
    return img, draw

def _header(draw, level_val, score_val):
    """Draw header row: LEVEL | TILT | SCORE."""
    pad = 60
    top = 180

    f_label = font(28)
    f_value = font(52, bold=True)

    # LEVEL
    draw.text((pad, top), "LEVEL", font=f_label, fill=GREY)
    draw.text((pad, top + 38), str(level_val), font=f_value, fill=WHITE)

    # SCORE
    score_str = str(score_val)
    bb = f_value.getbbox(score_str)
    sw = bb[2] - bb[0]
    draw.text((PHONE_W - pad - sw, top + 38), score_str, font=f_value, fill=GOLD)
    draw.text((PHONE_W - pad - 96, top), "SCORE", font=f_label, fill=GREY)

    # TILT title (center)
    draw_tilt_title(draw, PHONE_W // 2, top + 44, letter_size=80)
    f_tiny = font(24)
    bb2 = f_tiny.getbbox("THE MAZE PUZZLE")
    draw.text((PHONE_W // 2 - (bb2[2] - bb2[0]) // 2, top + 100), "THE MAZE PUZZLE",
              font=f_tiny, fill=GREY)

def _timer_bar(draw, ratio, top_y):
    pad = 60
    bw = PHONE_W - pad * 2
    draw_timer_bar(draw, pad, top_y, bw, 18, ratio)

def _grid(draw, player_idx, target_idx):
    cell = 240
    gap = 16
    grid_total = 3 * cell + 2 * gap
    gx = (PHONE_W - grid_total) // 2
    gy = 560
    draw_grid(draw, gx, gy, cell, player_idx, target_idx, gap=gap)
    return gy + grid_total

def make_screenshot_idle():
    img, draw = _phone_base()

    # Faint dimmed grid in upper portion
    cell = 220
    gap = 14
    grid_total = 3 * cell + 2 * gap
    gx = (PHONE_W - grid_total) // 2
    gy = 220
    for i in range(9):
        row = i // 3
        col = i % 3
        x0 = gx + col * (cell + gap)
        y0 = gy + row * (cell + gap)
        draw.rounded_rectangle([x0, y0, x0 + cell, y0 + cell],
                               radius=cell // 8, fill=(18, 36, 52))

    # Gradient overlay (stronger at bottom)
    overlay = Image.new("RGBA", (PHONE_W, PHONE_H), (0, 0, 0, 0))
    od = ImageDraw.Draw(overlay)
    for row_y in range(PHONE_H):
        alpha = min(220, int((row_y / PHONE_H) * 255))
        od.line([(0, row_y), (PHONE_W, row_y)], fill=(11, 22, 34, alpha))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Center content — positioned in lower half
    cy = 1020
    draw_tilt_title(draw, PHONE_W // 2, cy, letter_size=150, spacing_extra=14)

    f_sub = font(40)
    bb = f_sub.getbbox("THE MAZE PUZZLE")
    draw.text((PHONE_W // 2 - (bb[2] - bb[0]) // 2, cy + 112),
              "THE MAZE PUZZLE", font=f_sub, fill=GREY)

    f_desc = font(34)
    desc = "Tilt to reach the target"
    bb2 = f_desc.getbbox(desc)
    draw.text((PHONE_W // 2 - (bb2[2] - bb2[0]) // 2, cy + 190),
              desc, font=f_desc, fill=(150, 185, 210))

    # Divider dots
    for dx in range(-40, 41, 20):
        draw.ellipse([PHONE_W // 2 + dx - 4, cy + 290, PHONE_W // 2 + dx + 4, cy + 298],
                     fill=GRID_LINE)

    # BEST score
    f_best_lbl = font(32)
    bb3 = f_best_lbl.getbbox("BEST")
    draw.text((PHONE_W // 2 - (bb3[2] - bb3[0]) // 2, cy + 318),
              "BEST", font=f_best_lbl, fill=GREY)
    f_best_val = font(64, bold=True)
    bb4 = f_best_val.getbbox("0")
    draw.text((PHONE_W // 2 - (bb4[2] - bb4[0]) // 2, cy + 358),
              "0", font=f_best_val, fill=GOLD)

    # START GAME button
    btn_w, btn_h = 500, 110
    btn_x = (PHONE_W - btn_w) // 2
    btn_y = cy + 480
    draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h],
                           radius=55, fill=PLAYER)
    f_btn = font(46, bold=True)
    label = "START GAME"
    bb5 = f_btn.getbbox(label)
    lw = bb5[2] - bb5[0]
    lh = bb5[3] - bb5[1]
    draw.text((btn_x + (btn_w - lw) // 2, btn_y + (btn_h - lh) // 2 - bb5[1]),
              label, font=f_btn, fill=BG)

    img.save(f"{OUT}/screenshot_1_idle.png")
    print("screenshot_1_idle.png  saved")

def make_screenshot_playing():
    img, draw = _phone_base()

    _header(draw, level_val=3, score_val=3)
    _timer_bar(draw, ratio=0.55, top_y=350)
    grid_bottom = _grid(draw, player_idx=5, target_idx=8)

    img.save(f"{OUT}/screenshot_2_playing.png")
    print("screenshot_2_playing.png  saved")

def make_screenshot_gameover():
    img, draw = _phone_base()

    # Draw faint inactive grid (no active cells, just structure)
    cell = 240
    gap = 16
    grid_total = 3 * cell + 2 * gap
    gx = (PHONE_W - grid_total) // 2
    gy = 560
    for i in range(9):
        row = i // 3
        col = i % 3
        x0 = gx + col * (cell + gap)
        y0 = gy + row * (cell + gap)
        draw.rounded_rectangle([x0, y0, x0 + cell, y0 + cell],
                               radius=cell // 8, fill=DIM_CELL)

    # Semi-dark overlay — grid shows faintly through
    overlay = Image.new("RGBA", (PHONE_W, PHONE_H), (5, 10, 18, 175))
    img = Image.alpha_composite(img, overlay)
    draw = ImageDraw.Draw(img)

    # Content vertically centered (total height ~720px → top at ~600)
    content_top = 600

    # TIME UP
    f_tu = font(120, bold=True)
    label = "TIME UP"
    bb = f_tu.getbbox(label)
    draw.text((PHONE_W // 2 - (bb[2] - bb[0]) // 2, content_top), label, font=f_tu, fill=RED)

    # Score label + number
    f_score_lbl = font(40)
    bb2 = f_score_lbl.getbbox("SCORE")
    draw.text((PHONE_W // 2 - (bb2[2] - bb2[0]) // 2, content_top + 165),
              "SCORE", font=f_score_lbl, fill=GREY)

    f_score_val = font(200, bold=True)
    val = "7"
    bb3 = f_score_val.getbbox(val)
    draw.text((PHONE_W // 2 - (bb3[2] - bb3[0]) // 2, content_top + 210),
              val, font=f_score_val, fill=GOLD)

    # NEW BEST badge with star
    def star_poly(cx, cy, r_out, r_in, n=5):
        pts = []
        for k in range(n * 2):
            r = r_out if k % 2 == 0 else r_in
            angle = math.pi / n * k - math.pi / 2
            pts.append((cx + r * math.cos(angle), cy + r * math.sin(angle)))
        return pts

    badge_y = content_top + 470
    badge_w, badge_h = 340, 68
    badge_x = (PHONE_W - badge_w) // 2
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
                           radius=34, fill=(25, 65, 42))
    draw.rounded_rectangle([badge_x, badge_y, badge_x + badge_w, badge_y + badge_h],
                           radius=34, outline=PLAYER, width=2)
    star_cx = badge_x + 46
    star_cy = badge_y + badge_h // 2
    draw.polygon(star_poly(star_cx, star_cy, 20, 10), fill=PLAYER)
    f_badge = font(36)
    bl = "  NEW BEST!"
    bb4 = f_badge.getbbox(bl)
    draw.text((badge_x + (badge_w - (bb4[2] - bb4[0])) // 2 + 16, badge_y + 16),
              bl, font=f_badge, fill=PLAYER)

    # PLAY AGAIN button
    btn_w, btn_h = 500, 110
    btn_x = (PHONE_W - btn_w) // 2
    btn_y = content_top + 600
    draw.rounded_rectangle([btn_x, btn_y, btn_x + btn_w, btn_y + btn_h],
                           radius=55, fill=PLAYER)
    f_btn = font(46, bold=True)
    label2 = "PLAY AGAIN"
    bb5 = f_btn.getbbox(label2)
    lw = bb5[2] - bb5[0]
    lh = bb5[3] - bb5[1]
    draw.text((btn_x + (btn_w - lw) // 2, btn_y + (btn_h - lh) // 2 - bb5[1]),
              label2, font=f_btn, fill=BG)

    img.save(f"{OUT}/screenshot_3_gameover.png")
    print("screenshot_3_gameover.png  saved")

# ─────────────────────────────────────────────────────────────────────────────
if __name__ == "__main__":
    make_icon()
    make_feature()
    make_screenshot_idle()
    make_screenshot_playing()
    make_screenshot_gameover()
    print("\nAll store images saved to:", OUT)
