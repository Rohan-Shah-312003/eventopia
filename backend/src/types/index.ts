export interface UserPayload {
  id: string;
  name: string;
  reg_no: string;
  role: string;
}

export interface CreateEventRequest {
  name: string;
  type: string;
  event_owner_id: string;
  venue: string;
  description?: string;
  date: string;
  time: string;
  equipments?: any;
}

export interface CreateClubRequest {
  name: string;
  type: string;
  description?: string;
  president_id: string;
  vice_president_id?: string;
  faculty_coordinator_id?: string;
  budget?: number;
}