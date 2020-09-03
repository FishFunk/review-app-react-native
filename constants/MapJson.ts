import theme from '../styles/theme';

export default [
    {
      "elementType": "geometry.stroke",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "elementType": "labels",
      "stylers": [
        {
          "color": theme.DARK_COLOR
        },
        {
          "visibility": "simplified"
        },
        {
          "weight": 0.5
        }
      ]
    },
    {
      "featureType": "administrative.land_parcel",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "administrative.neighborhood",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "landscape.man_made",
      "elementType": "geometry.fill",
      "stylers": [
        {
          "color": theme.LIGHT_COLOR
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "stylers": [
        {
          "color": theme.PRIMARY_COLOR
        },
        {
          "visibility": "simplified"
        },
        {
          "weight": 0.5
        }
      ]
    },
    {
      "featureType": "road.arterial",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.highway",
      "stylers": [
        {
          "color": theme.PRIMARY_COLOR
        },
        {
          "weight": 0.5
        }
      ]
    },
    {
      "featureType": "road.highway",
      "elementType": "labels",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "road.local",
      "stylers": [
        {
          "visibility": "simplified"
        }
      ]
    },
    {
      "featureType": "transit",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "transit.line",
      "stylers": [
        {
          "visibility": "off"
        }
      ]
    },
    {
      "featureType": "water",
      "stylers": [
        {
          "color": theme.SECONDARY_COLOR
        }
      ]
    }
  ]