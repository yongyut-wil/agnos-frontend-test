export interface Patient {
    firstName: string;
    middleName?: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    phone: string;
    email: string;
    address: string;
    preferredLanguage: string;
    nationality: string;
    emergencyContact?: {
        name: string;
        relationship: string;
    };
    religion?: string;
}
