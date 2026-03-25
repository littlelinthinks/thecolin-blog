
# Image Optimization Instructions

## 1. Install Image Optimization Tools

```bash
# Using Homebrew on macOS
brew install webp
brew install imagemagick

# Or use online tools:
# - Squoosh: https://squoosh.app/
# - TinyPNG: https://tinypng.com/
```

## 2. Convert PNG to WebP

```bash
cd "/Users/colinying/Desktop/Personal Blog Website/images"

# Convert to WebP with quality 85
cwebp -q 85 wechat-qr.png -o wechat-qr.webp
cwebp -q 85 alipay-qr.png -o alipay-qr.webp

# Convert to AVIF (if supported)
# Requires avifenc or use Squoosh.app
```

## 3. Optimize Existing PNGs

```bash
# Using ImageMagick
convert wechat-qr.png -strip -quality 85 -define png:compression-level=9 wechat-qr-opt.png
convert alipay-qr.png -strip -quality 85 -define png:compression-level=9 alipay-qr-opt.png
```

## 4. HTML Usage

Replace direct img tags with picture elements:


### For wechat-qr.png:
```html
<picture>
    <source
        type="image/avif"
        srcset="/images/wechat-qr.avif"
        width="300"
        height="300">
    <source
        type="image/webp"
        srcset="/images/wechat-qr.webp"
        width="300"
        height="300">
    <img
        src="/images/wechat-qr.png"
        alt="微信公众号二维码"
        width="300"
        height="300"
        loading="lazy"
        decoding="async"
        style="max-width:100%;height:auto">
</picture>
```

### For alipay-qr.png:
```html
<picture>
    <source
        type="image/avif"
        srcset="/images/alipay-qr.avif"
        width="300"
        height="300">
    <source
        type="image/webp"
        srcset="/images/alipay-qr.webp"
        width="300"
        height="300">
    <img
        src="/images/alipay-qr.png"
        alt="支付宝收款码"
        width="300"
        height="300"
        loading="lazy"
        decoding="async"
        style="max-width:100%;height:auto">
</picture>
```
