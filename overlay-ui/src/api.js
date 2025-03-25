export const fetchLeagueHeroStatistics = async (leagueId) => {
  const myHeaders = new Headers();
  myHeaders.append("token", "28ccf915-fb81-4b04-9716-8d772d24b5c3");
  myHeaders.append("Content-Type", "application/json");

  const raw = {
    "league_id": 17417
}

  const requestOptions = {
    method: 'POST',
    headers: myHeaders,
    body: raw,
    redirect: 'follow'
  };

  try {
    console.log('Fetching hero statistics for league ID:', leagueId); // Log the league ID
    const response = await fetch("/league/heroes", requestOptions);
    console.log('Response status:', response.status); // Log the response status
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }
    const result = await response.json();
    console.log('Fetched hero statistics:', result); // Log the fetched data
    return result.hero_statistics.heroes;
  } catch (error) {
    console.error('Error fetching hero statistics:', error);
    return [];
  }
};