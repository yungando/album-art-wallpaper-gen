import ColorThief from 'colorthief'

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

async function getDistance(x1: number, y1: number, x2: number,  y2: number)
{
    return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) * 1.0);
}

export async function process(image: HTMLImageElement, w: number, h: number, shadowSize: number = 100, centerScale: number = 0.55)
{
	const colorThief = new ColorThief();

	const canvas = await createCanvas();
	const canvasCtx = canvas.getContext("2d");
	canvas.width = w;
	canvas.height = h;

	// turn source image into workable canvas

	const srcCanvas = await createCanvas(image);

	// bg

	let bgColor: number[] = colorThief.getColor(image);
	let gradColors = colorThief.getPalette(image);

	// fg

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

		// radial-gradient(ellipse at 100% 100%, #D6B587 0%, transparent 50%), radial-gradient(ellipse at 70% 0, #D72609 0%, transparent 50%),
		// radial-gradient(ellipse at 30% 100%, #F79B05 0%, transparent 50%), radial-gradient(ellipse at 10% 0, #8C6634 0%, transparent 50%),
		// linear-gradient(#41381C, #41381C); background-blend-mode: normal;

		var circleSize = 300;

		var bgGradient = canvasCtx.createLinearGradient(0, 0, canvas.width, canvas.height);
		bgGradient.addColorStop(0, `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`);
		bgGradient.addColorStop(1, `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`);

		var radGradientDist1 = await getDistance(canvas.width, canvas.height, 0, 0);
		var radGradient1 = canvasCtx.createRadialGradient(canvas.width, canvas.height, circleSize, canvas.width, canvas.height, radGradientDist1);
		radGradient1.addColorStop(0, `rgb(${gradColors[0][0]}, ${gradColors[0][1]}, ${gradColors[0][2]})`);
		radGradient1.addColorStop(1, `rgba(0, 0, 0, 0)`);

		var radGradientDist2 = await getDistance(canvas.width * 0.7, 0, 0, canvas.height);
		var radGradient2 = canvasCtx.createRadialGradient(canvas.width * 0.7, 0, circleSize, canvas.width * 0.7, 0, radGradientDist2);
		radGradient2.addColorStop(0, `rgb(${gradColors[1][0]}, ${gradColors[1][1]}, ${gradColors[1][2]})`);
		radGradient2.addColorStop(1, `rgba(0, 0, 0, 0)`);

		var radGradientDist3 = await getDistance(canvas.width * 0.3, canvas.height, canvas.width, 0);
		var radGradient3 = canvasCtx.createRadialGradient(canvas.width * 0.3, canvas.height, circleSize, canvas.width * 0.3, canvas.height, radGradientDist3);
		radGradient3.addColorStop(0, `rgb(${gradColors[2][0]}, ${gradColors[2][1]}, ${gradColors[2][2]})`);
		radGradient3.addColorStop(1, `rgba(0, 0, 0, 0)`);

		var radGradientDist4 = await getDistance(canvas.width * 0.1, 0, canvas.width, canvas.height);
		var radGradient4 = canvasCtx.createRadialGradient(canvas.width * 0.1, 0, circleSize, canvas.width * 0.1, 0, radGradientDist4);
		radGradient4.addColorStop(0, `rgb(${gradColors[3][0]}, ${gradColors[3][1]}, ${gradColors[3][2]})`);
		radGradient4.addColorStop(1, `rgba(0, 0, 0, 0)`);

		canvasCtx.fillStyle = bgGradient;
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
		canvasCtx.fillStyle = radGradient1;
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
		canvasCtx.fillStyle = radGradient2;
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
		canvasCtx.fillStyle = radGradient3;
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);
		canvasCtx.fillStyle = radGradient4;
		canvasCtx.fillRect(0, 0, canvas.width, canvas.height);

		canvasCtx.drawImage(fgShadow, fgXshift, fgYshift, canvas.height * centerScale, canvas.height * centerScale); 
	}
	else
	{
		// portrait

		const fgXshift = (canvas.width - (centerScale * canvas.width)) / 2;
		const fgYshift = (canvas.height - (centerScale * canvas.width)) / 2;

		const bgGradient = canvasCtx.createLinearGradient(0, 0, canvas.width, canvas.height);

		bgGradient.addColorStop(0, `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`);
		bgGradient.addColorStop(1, `rgb(${bgColor[0]}, ${bgColor[1]}, ${bgColor[2]})`);

		canvasCtx.fillStyle = bgGradient;
		canvasCtx.fillRect(0, 0, canvas.height, canvas.width);
		canvasCtx.drawImage(fgShadow, fgXshift, fgYshift, canvas.width * centerScale, canvas.width * centerScale); 
	}

	return await new Promise((resolve: (value: Blob) => void) =>
	{
		canvas.toBlob((blob) => resolve(blob));
	});
}