export interface reviewSummary {
    img: string;
    name: string;
    comments: string;
    avg_rating: number;
    date: string;
    reviewer_id: string;
  }

  export interface postReview {
      place_id: string;
      place_name: string;
      reviewer_id: string;
      atmosphere: number;
      menu: number;
      service: number;
      avg_rating: number;
      comments: string;
      date: string;
  }