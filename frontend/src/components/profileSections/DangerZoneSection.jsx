import React from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '../ui/Button';


const DangerZoneSection = () => {

    return (
        <div className="space-y-6" style={{ width: 'clamp(300px, 30vw, 600px)' }}>
            <Card>
                <CardHeader>
                    <CardTitle>Danger Zone</CardTitle>
                    <CardDescription>
                        Those actions are irreversible
                    </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg border p-4">
                        <div className="flex items-center gap-3">
                            <div>
                                <h4 className="font-medium">Delete Account</h4>
                                <p className="text-muted-foreground text-sm">
                                    This will forever delete your account
                                </p>
                            </div>
                        </div>
                        <Button variant='destructive'>Delete</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export default DangerZoneSection
