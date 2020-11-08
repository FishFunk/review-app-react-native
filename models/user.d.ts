export interface appUser {
    email?: string;
    dateJoined?: string;
    lastActive?: string;
    firstName?: string;
    lastName?: string;
    following?: string[];
    id?: string;
    reviews?: object[];
    mobile?: string;
    photoUrl?: string;
    email_verified?: boolean;
    push_tokens?: string[];
    phone_verified?: boolean;
}