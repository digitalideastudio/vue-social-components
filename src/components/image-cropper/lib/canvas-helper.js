const canvasHelper = {
    getImageType(str) {
        let mimeType = 'image/jpeg';
        const outputType = str.match(/(image\/[\w]+)\.*/)[0];
        if (typeof outputType !== 'undefined') {
            mimeType = outputType;
        }
        return mimeType;
    },

    compress(src, quality, callback) {
        const reader = new FileReader();
        const self = this;
        reader.onload = function readerOnload(event) {
            const image = new Image();
            image.src = event.target.result;
            image.onload = function imageOnload() {
                const mimeType = self.getImageType(src.type);
                const cvs = self.getCanvas(image.naturalWidth, image.naturalHeight);
                // const ctx = cvs.getContext('2d').drawImage(image, 0, 0);
                const newImageData = cvs.toDataURL(mimeType, quality / 100);
                callback(newImageData);
            };
        };
        reader.readAsDataURL(src);
    },

    crop(image, options, callback) {
        const checkNumber = function checkNumber(num) {
            return (typeof num === 'number');
        };
        // check crop options
        if (checkNumber(options.toCropImgX) &&
            checkNumber(options.toCropImgY) &&
            options.toCropImgW > 0 &&
            options.toCropImgH > 0) {
            let w = options.toCropImgW;
            let h = options.toCropImgH;
            if (options.maxWidth && options.maxWidth < w) {
                w = options.maxWidth;
                h = (options.toCropImgH * w) / options.toCropImgW;
            }
            if (options.maxHeight && options.maxHeight < h) {
                h = options.maxHeight;
            }
            const cvs = this.getCanvas(w, h);
            // const ctx = cvs.getContext('2d').drawImage(
            //     image,
            //     options.toCropImgX,
            //     options.toCropImgY,
            //     options.toCropImgW,
            //     options.toCropImgH,
            //     0,
            //     0,
            //     w,
            //     h
            // );
            const mimeType = this.getImageType(image.src);
            const data = cvs.toDataURL(mimeType, options.compress / 100);
            callback(data);
        }
    },

    resize(image, options, callback) {
        const checkNumber = function checkNumber(num) {
            return (typeof num === 'number');
        };

        if (checkNumber(options.toCropImgX) &&
            checkNumber(options.toCropImgY) &&
            options.toCropImgW > 0 &&
            options.toCropImgH > 0
        ) {
            const w = options.toCropImgW * options.imgChangeRatio;
            const h = options.toCropImgH * options.imgChangeRatio;
            const cvs = this.getCanvas(w, h);
            // const ctx = cvs.getContext('2d').drawImage(
            //     image,
            //     0,
            //     0,
            //     options.toCropImgW,
            //     options.toCropImgH,
            //     0,
            //     0,
            //     w,
            //     h
            // );
            const mimeType = this.getImageType(image.src);
            const data = cvs.toDataURL(mimeType, options.compress / 100);
            callback(data);
        }
    },

    rotate(src, deg, callback) {
        this.loadImage(src, (image) => {
            let w = image.naturalWidth;
            let h = image.naturalHeight;
            let degrees = deg;
            const canvasWidth = Math.max(w, h);
            const canvasHeight = Math.max(w, h);
            const cvs = this.getCanvas(canvasWidth, canvasHeight);
            const ctx = cvs.getContext('2d');

            ctx.save();
            ctx.translate(canvasWidth / 2, canvasWidth / 2);
            ctx.rotate(degrees * (Math.PI / 180));

            let x = -canvasWidth / 2;
            let y = -canvasWidth / 2;

            degrees %= 360;
            if (degrees === 0) {
                return callback(src, w, h);
            }
            if ((degrees % 180) !== 0) {
                if (degrees === -90 || degrees === 270) {
                    x = -w + (canvasWidth / 2);
                } else {
                    y = (canvasWidth / 2) - h;
                }
                const c = w;
                w = h;
                h = c;
            } else {
                x = (canvasWidth / 2) - w;
                y = (canvasWidth / 2) - h;
            }

            ctx.drawImage(image, x, y);

            const cvs2 = this.getCanvas(w, h);
            const ctx2 = cvs2.getContext('2d');

            ctx2.drawImage(cvs, 0, 0, w, h, 0, 0, w, h);

            const mimeType = this.getImageType(image.src);
            const data = cvs.toDataURL(mimeType, 1);

            return callback(data, w, h);
        });
    },

    loadImage(data, callback) {
        const image = new Image();
        image.src = data;
        image.onload = function imageOnload() {
            callback(image);
        };
        image.onerror = function imageOnerror() {
            throw new Error('Error loading image');
        };
    },

    getCanvas(width, height) {
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        return canvas;
    },
};

export default canvasHelper;
