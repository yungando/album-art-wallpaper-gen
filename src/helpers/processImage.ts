async function createCanvas(src?: HTMLImageElement | HTMLCanvasElement): Promise<HTMLCanvasElement>
{
	const canvas = document.createElement("canvas");
	const ctx = canvas.getContext("2d");

	if (src)
	{
		canvas.width = src.width;
		canvas.height = src.height;
		ctx.drawImage(src, 0, 0);
	}

	return canvas;
}

export async function process(image: HTMLImageElement, w: number, h: number, blurPx: number = 80, blurOpacity: number = 80, shadowSize: number = 70, centerScale: number = 0.55)
{
	const canvas = await createCanvas();
	const canvasCtx = canvas.getContext("2d");
	canvas.width = w;
	canvas.height = h;

	// turn source image into workable canvas

	const srcCanvas = await createCanvas(image);

	const fgShadow = document.createElement("canvas");
	const fgShadowCtx = fgShadow.getContext("2d");

	fgShadow.width = srcCanvas.width + shadowSize*2;
	fgShadow.height = srcCanvas.height + shadowSize*2;

	fgShadowCtx.shadowBlur = shadowSize;
	fgShadowCtx.shadowColor = "black";

	fgShadowCtx.drawImage(srcCanvas, shadowSize, shadowSize);

	// overlay

	if ((w/h) > 1)
	{
		// landscape

		// calculate fg centering shift
		const fgXshift = (canvas.width - (centerScale * canvas.height)) / 2;
		const fgYshift = (canvas.height - (centerScale * canvas.height)) / 2;

		canvasCtx.filter = `blur(${blurPx}px) opacity(${blurOpacity}%)`;
		canvasCtx.drawImage(srcCanvas, 0, -(canvas.width/4), canvas.width, canvas.width);

		canvasCtx.filter = "none";
		canvasCtx.drawImage(fgShadow, fgXshift, fgYshift, canvas.height * centerScale, canvas.height * centerScale); 
		}
		else
		{
		// portrait

		const fgXshift = (canvas.width - (centerScale * canvas.width)) / 2;
		const fgYshift = (canvas.height - (centerScale * canvas.width)) / 2;

		canvasCtx.filter = `blur(${blurPx}px) opacity(${blurOpacity}%)`;
		canvasCtx.drawImage(srcCanvas, -(canvas.width/2.5), 0, canvas.height, canvas.height);

		canvasCtx.filter = "none";
		canvasCtx.drawImage(fgShadow, fgXshift, fgYshift, canvas.width * centerScale, canvas.width * centerScale); 
	}

	return await new Promise((resolve: (value: Blob) => void) =>
	{
		canvas.toBlob((blob) => resolve(blob));
	});
}