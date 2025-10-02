// src/pages/Dashboard.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import "../styles/Dashboard.css";

const Dashboard = () => {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [tvShows, setTvShows] = useState([]);
  const [userRatings, setUserRatings] = useState([]);
  const [watchHistory, setWatchHistory] = useState([]);

  // Helper: Check if token is expired
  const isTokenExpired = (token) => {
    if (!token) return true;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      // 'exp' is in seconds; multiply by 1000 for comparison with Date.now()
      return payload.exp * 1000 < Date.now();
    } catch (err) {
      console.error('Error decoding token:', err);
      return true;
    }
  };

  // Verify token on mount
  useEffect(() => {
    const token = localStorage.getItem('jwtToken');
    if (!token || isTokenExpired(token)) {
      localStorage.removeItem('jwtToken');
      localStorage.removeItem('loggedInUser');
      navigate('/login');
    }
  }, [navigate]);

  // Fetch dashboard data if token is valid
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [moviesResp, tvResp, ratingsResp, historyResp] = await Promise.all([
          fetch('http://localhost:3002/movies'),
          fetch('http://localhost:3002/tv_shows'),
          fetch('http://localhost:3002/user_ratings'),
          fetch('http://localhost:3002/watch_history')
        ]);
        const moviesData = await moviesResp.json();
        const tvData = await tvResp.json();
        const ratingsData = await ratingsResp.json();
        const historyData = await historyResp.json();

        setMovies(moviesData);
        setTvShows(tvData);
        setUserRatings(ratingsData);
        setWatchHistory(historyData);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      }
    };
    fetchData();
  }, []);

  // Combined media for charts that need both movies and tv shows
  const allMedia = [...movies, ...tvShows];

  /* ---------- Chart 1: Release Year Timeline (Column Chart) ---------- */
  const yearChartRef = useRef(null);
  useEffect(() => {
    if (movies.length === 0 && tvShows.length === 0) return;
    const yearCounts = {};
    allMedia.forEach(media => {
      if (media.Year) {
        // If the Year field contains a range (e.g. "2010–2015"), take the first year.
        const year = media.Year.split('–')[0].trim();
        yearCounts[year] = (yearCounts[year] || 0) + 1;
      }
    });
    const sortedYears = Object.keys(yearCounts).sort();
    const chartData = sortedYears.map(year => ({ year, count: yearCounts[year] }));

    let root = am5.Root.new(yearChartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    let chart = root.container.children.push(am5xy.XYChart.new(root, {}));

    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "year",
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
    }));
    xAxis.data.setAll(chartData);

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));

    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Releases",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "year",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: "{categoryX}: {valueY}" })
    }));
    series.columns.template.setAll({ cornerRadiusTL: 10, cornerRadiusTR: 10 });
    series.data.setAll(chartData);

    return () => {
      root.dispose();
    };
  }, [movies, tvShows]);

  /* ---------- Chart 2: User vs IMDb Rating Scatter Plot (Triangle Bullets) ---------- */
  const scatterChartRef = useRef(null);
  useEffect(() => {
    if (movies.length === 0 && tvShows.length === 0) return;
    const mediaRatingsMap = {};
    userRatings.forEach(r => {
      const id = r.movieId || r.media_id;
      if (id) {
        if (!mediaRatingsMap[id]) mediaRatingsMap[id] = [];
        mediaRatingsMap[id].push(Number(r.rating));
      }
    });
    const scatterPoints = allMedia.map(media => {
      const id = media.id;
      const avgUserRating = mediaRatingsMap[id]
        ? mediaRatingsMap[id].reduce((a, b) => a + b, 0) / mediaRatingsMap[id].length
        : null;
      const imdb = Number(media.imdbRating);
      if (avgUserRating !== null && !isNaN(imdb)) {
        return { x: imdb, y: avgUserRating, label: media.Title };
      }
      return null;
    }).filter(point => point !== null);

    let root = am5.Root.new(scatterChartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    let chart = root.container.children.push(am5xy.XYChart.new(root, {}));

    let xAxis = chart.xAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50 }),
      tooltip: am5.Tooltip.new(root, { labelText: "IMDb Rating: {value}" })
    }));
    xAxis.set("title", "IMDb Rating");

    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));
    yAxis.set("title", "User Rating");

    let series = chart.series.push(am5xy.LineSeries.new(root, {
      xAxis,
      yAxis,
      valueXField: "x",
      valueYField: "y",
      tooltip: am5.Tooltip.new(root, { labelText: "{label}: [bold]{x}[/] vs [bold]{y}[/]" })
    }));
    series.data.setAll(scatterPoints);
    series.strokes.template.setAll({ strokeWidth: 0 });
    series.bullets.push(() => {
      return am5.Bullet.new(root, {
        sprite: am5.Triangle.new(root, {
          direction: "up",
          width: 10,
          height: 10,
          fill: am5.color(0xff9f40)
        })
      });
    });

    return () => {
      root.dispose();
    };
  }, [movies, tvShows, userRatings]);

  /* ---------- Chart 3: Watch History Heatmap (Column Chart with Gradient) ---------- */
  const watchChartRef = useRef(null);
  useEffect(() => {
    if (watchHistory.length === 0) return;
    const watchCounts = {};
    watchHistory.forEach(record => {
      if (record.date) {
        watchCounts[record.date] = (watchCounts[record.date] || 0) + 1;
      }
    });
    const sortedDates = Object.keys(watchCounts).sort();
    const chartData = sortedDates.map(date => ({ date, count: watchCounts[date] }));

    let root = am5.Root.new(watchChartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    let chart = root.container.children.push(am5xy.XYChart.new(root, {}));
    let xAxis = chart.xAxes.push(am5xy.CategoryAxis.new(root, {
      categoryField: "date",
      renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 30 })
    }));
    xAxis.data.setAll(chartData);
    let yAxis = chart.yAxes.push(am5xy.ValueAxis.new(root, {
      renderer: am5xy.AxisRendererY.new(root, {})
    }));
    let series = chart.series.push(am5xy.ColumnSeries.new(root, {
      name: "Watch Count",
      xAxis: xAxis,
      yAxis: yAxis,
      valueYField: "count",
      categoryXField: "date",
      sequencedInterpolation: true,
      tooltip: am5.Tooltip.new(root, { labelText: "{categoryX}: {valueY}" })
    }));
    series.columns.template.setAll({ cornerRadiusTL: 10, cornerRadiusTR: 10, fillOpacity: 0.8 });
    series.data.setAll(chartData);
    return () => {
      root.dispose();
    };
  }, [watchHistory]);

  /* ---------- Chart 4: User Ratings Distribution (Pie Chart) ---------- */
  const ratingChartRef = useRef(null);
  useEffect(() => {
    if (userRatings.length === 0) return;
    const ratingCounts = {};
    userRatings.forEach(rating => {
      const r = rating.rating;
      ratingCounts[r] = (ratingCounts[r] || 0) + 1;
    });
    const chartData = Object.keys(ratingCounts).map(r => ({
      rating: r,
      count: ratingCounts[r]
    }));

    let root = am5.Root.new(ratingChartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    let chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: am5.percent(50)
    }));
    let series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "count",
      categoryField: "rating",
      tooltip: am5.Tooltip.new(root, { labelText: "{category}: {value}" })
    }));
    series.data.setAll(chartData);

    return () => {
      root.dispose();
    };
  }, [userRatings]);

  /* ---------- Chart 5: Genre Distribution (Donut Chart as Big Chart) ---------- */
  const genreChartRef = useRef(null);
  useEffect(() => {
    if (movies.length === 0 && tvShows.length === 0) return;
    const genreCounts = {};
    allMedia.forEach(media => {
      if (media.Genre) {
        media.Genre.split(',').map(g => g.trim()).forEach(g => {
          if (g) genreCounts[g] = (genreCounts[g] || 0) + 1;
        });
      }
    });
    const chartData = Object.keys(genreCounts).map(genre => ({
      genre,
      count: genreCounts[genre]
    }));

    let root = am5.Root.new(genreChartRef.current);
    root.setThemes([am5themes_Animated.new(root)]);
    let chart = root.container.children.push(am5percent.PieChart.new(root, {
      layout: root.verticalLayout,
      innerRadius: am5.percent(50)
    }));
    let series = chart.series.push(am5percent.PieSeries.new(root, {
      valueField: "count",
      categoryField: "genre"
    }));
    series.data.setAll(chartData);

    return () => {
      root.dispose();
    };
  }, [movies, tvShows]);

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">Dashboard</h1>
      
      <div className="charts-grid">
        {/* Row 1: Release Year Timeline */}
        <div className="chart-item">
          <h2>Release Year Timeline</h2>
          <div ref={yearChartRef} style={{ width: "100%", height: "400px", backgroundColor: "#fff" }}></div>
        </div>
        
        {/* Row 2: User vs IMDb Rating Scatter Plot */}
        <div className="chart-item">
          <h2>User vs IMDb Rating</h2>
          <div ref={scatterChartRef} style={{ width: "100%", height: "400px", backgroundColor: "#fff" }}></div>
        </div>
        
        {/* Row 3: Watch History Heatmap */}
        <div className="chart-item">
          <h2>Watch History</h2>
          <div ref={watchChartRef} style={{ width: "100%", height: "400px", backgroundColor: "#fff" }}></div>
        </div>
        
        {/* Row 4: User Ratings Distribution */}
        <div className="chart-item">
          <h2>User Ratings Distribution</h2>
          <div ref={ratingChartRef} style={{ width: "100%", height: "400px", backgroundColor: "#fff" }}></div>
        </div>
        
        {/* Row 5: Genre Distribution (Big Chart) */}
        <div className="chart-item big-chart">
          <h2>Genre Distribution</h2>
          <div ref={genreChartRef} style={{ width: "100%", height: "600px", backgroundColor: "#fff" }}></div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
