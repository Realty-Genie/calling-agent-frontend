import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { name, phoneNumber, agentType } = body;

        console.log('Mock Call Initiated:', {
            name,
            phoneNumber,
            agentType,
            timestamp: new Date().toISOString()
        });

        // Simulate processing delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        return NextResponse.json({
            success: true,
            message: 'Mock call initiated successfully',
            data: { name, phoneNumber, agentType }
        });
    } catch (error) {
        console.error('Mock call error:', error);
        return NextResponse.json(
            { success: false, message: 'Failed to initiate mock call' },
            { status: 500 }
        );
    }
}
