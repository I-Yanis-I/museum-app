export async function GET() {
    return Response.json({
        status: 'OK',
        service: 'museum-api',
        timestamp: new Date().toISOString(),
        framework: 'Next.js API Routes'
    });
}