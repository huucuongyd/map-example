import { useEffect, useRef, useState } from 'react'
import maplibregl from '@openmapvn/openmapvn-gl'
import '@openmapvn/openmapvn-gl/dist/maplibre-gl.css'
import './App.css'

function StreetViewPopup({ lat, lon, onClose }) {
  const containerRef = useRef(null)
  const photoRef = useRef(null)

  useEffect(() => {
    if (!containerRef.current || !window.StreetViewVN_Viewer) return

    const { Photo } = window.StreetViewVN_Viewer
    const { PhotoAdapter } = window.StreetViewVN_Viewer.adapter
    const { VirtualTourPlugin, CompassPlugin, PlanPlugin, TrackPlugin } = window.StreetViewVN_Viewer.plugins

    const BASE_PANORAMA = {
      baseUrl: 'http://streetview.vn/loader_hd.png',
      width: 1280,
      cols: 2,
      rows: 1,
      tileUrl: () => null
    }

    const photo = new Photo({
      apiKey: 'zs3Vn53KRgpfl0k5LwvRT6R66wZ8bAM5',
      lang: {
        zoom: 'Thu phóng',
        zoomOut: 'Thu nhỏ',
        zoomIn: 'Phóng to',
        moveUp: 'Tiến',
        moveDown: 'Lùi',
        moveLeft: 'Trái',
        moveRight: 'Phải',
        description: 'Chi tiết',
        download: 'Tải xuống',
        fullscreen: 'Toàn màn hình',
        loading: 'Đang tải...',
        menu: 'Danh mục',
        close: 'Đóng',
        twoFingers: 'Sử dụng 2 ngón tay để điều hướng',
        ctrlZoom: 'Sử dụng Ctrl + scroll để thu phóng ảnh',
        loadError: 'Không thể tải hình ảnh 360 lúc này',
        webglError: 'Trình duyệt của bạn không hỗ trợ WebGL'
      },
      container: containerRef.current,
      navbar: false,
      panorama: BASE_PANORAMA,
      loadingImg: 'http://streetview.vn/logo.svg',
      adapter: [
        PhotoAdapter,
        {
          showErrorTile: false,
          baseBlur: false,
          resolution: 64,
          shouldGoFast: () => false
        }
      ],
      defaultZoomLvl: 0,
      defaultYaw: 0,
      defaultPitch: 0,
      plugins: [
        [
          CompassPlugin,
          {
            size: '34px',
            position: ['top', 'right']
          }
        ],
        [PlanPlugin, {
          defaultZoom: 9
        }],
        [TrackPlugin, {}],
        [
          VirtualTourPlugin,
          {
            arrowEnabled: false,
            preload: true
          }
        ]
      ]
    })

    photo
      .getPlugin(VirtualTourPlugin)
      .setCurrentLatLng({ lng: lon, lat: lat }, true)

    photoRef.current = photo

    return () => {
      if (photoRef.current) {
        photoRef.current.destroy()
        photoRef.current = null
      }
    }
  }, [lat, lon])

  return (
    <div className="streetview-popup-overlay" onClick={onClose}>
      <div className="streetview-popup" onClick={(e) => e.stopPropagation()}>
        <button className="streetview-close-btn" onClick={onClose}>
          ×
        </button>
        <div ref={containerRef} className="streetview-container" />
      </div>
    </div>
  )
}

function App() {
  const mapContainer = useRef(null)
  const map = useRef(null)
  const initialized = useRef(false)
  const [streetViewData, setStreetViewData] = useState(null)

  useEffect(() => {
    if (initialized.current || !mapContainer.current) return
    initialized.current = true

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current,
      style: 'https://maptiles.ndamaps.vn/styles/day-v1/style.json',
      center: [105.85237, 21.03024],
      zoom: 15,
      maplibreLogo: true
    })

    mapInstance.on('click', (e) => {
      const { lng, lat } = e.lngLat
      setStreetViewData({ lat, lon: lng })
    })

    map.current = mapInstance

    return () => {
      if (mapInstance) {
        mapInstance.remove()
        map.current = null
        initialized.current = false
      }
    }
  }, [])

  return (
    <div className="app-container">
      <div ref={mapContainer} className="map-container" />
      {streetViewData && (
        <StreetViewPopup
          lat={streetViewData.lat}
          lon={streetViewData.lon}
          onClose={() => setStreetViewData(null)}
        />
      )}
    </div>
  )
}

export default App
