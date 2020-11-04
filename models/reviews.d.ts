export interface reviewSummary {
    img: string;
    name: string;
    comments: string;
    avg_rating: number;
    pricing: number;
    date: string;
    reviewer_id: string;
    place_id: string;
    review_key: string;
    reports: Array[];
    thanks: Array[];
  }

  export interface dbReview {
    place_id: string;
    place_name: string;
    reviewer_id: string;
    atmosphere: number;
    menu: number;
    service: number;
    avg_rating: number;
    pricing: number;
    comments: string;
    date: string;
    reports: Array[];
    thanks: Array[];
  }