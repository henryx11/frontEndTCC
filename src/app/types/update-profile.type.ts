export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone?: string;
  password?: string;
  currentPassword?: string;
}

export interface UpdateProfileResponse {
  uuid: string;
  name: string;
  email: string;
  phone: string;
  message?: string;
}
