export async function GET() {
    return Response.json({
        message: 'Museum API - Server started successfully.',
        timestamp: new Date().toISOString(),
        framework: 'Next.js API Routes'
    });
}