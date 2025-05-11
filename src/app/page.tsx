const handleLocationSelect = async (selectedLocation: Location) => {
  try {
    setSelectedLocation(selectedLocation);
    setShowLocationModal(false);
    setSearchQuery(selectedLocation.name);
    setMapCenter({
      lat: selectedLocation.lat,
      lng: selectedLocation.lng
    });
    
    // 선택된 위치로 음식점 검색
    const response = await fetch(`/api/restaurants?lat=${selectedLocation.lat}&lng=${selectedLocation.lng}`);
    if (!response.ok) {
      throw new Error('음식점 정보를 가져오는데 실패했습니다.');
    }
    const data = await response.json();
    setRestaurants(data);
    
    return { lat: selectedLocation.lat, lng: selectedLocation.lng };
  } catch (error) {
    console.error('위치 선택 처리 중 오류:', error);
    return null;
  }
}; 

{showLocationModal && (
  <LocationModal
    onClose={() => setShowLocationModal(false)}
    onSelect={(address: string, latitude: number, longitude: number) => {
      const newLocationInfo: LocationInfo = {
        address,
        latitude,
        longitude,
        type: 'manual' as const
      };
      console.log('수동 선택 위치 정보:', newLocationInfo);
      setLocationInfo(newLocationInfo);
      setIsLoading(false);
    }}
  />
)} 