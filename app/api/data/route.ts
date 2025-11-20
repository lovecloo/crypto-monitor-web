export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const GIST_ID = '9ce448847985c295b725dc774130964f';
  const timestamp = Date.now();
  
  try {
    const response = await fetch(
      `https://gist.githubusercontent.com/lovecloo/${GIST_ID}/raw/data.json?t=${timestamp}`,
      {
        cache: 'no-store',
        next: { revalidate: 0 },
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    return Response.json(data, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
    return Response.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    );
  }
}

