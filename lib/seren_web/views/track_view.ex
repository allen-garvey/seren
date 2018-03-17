defmodule SerenWeb.TrackView do
  use SerenWeb, :view
  alias SerenWeb.TrackView
  alias SerenWeb.SharedView

  def render("index.json", %{tracks: tracks}) do
    %{data: render_many(tracks, TrackView, "track_excerpt.json")}
  end

  def render("show.json", %{track: track}) do
    %{data: render_one(track, TrackView, "track.json")}
  end

  def render("track_excerpt.json", %{track: track}) do
    %{
      id: track.id,
      title: track.title,
      artist_id: track.artist_id,
      genre_id: track.genre_id,
      date_added: SharedView.datetime_to_us_date(track.date_added),
      file_type: track.file_type,
      file_path: track.file_path,
      length: track.length,
      bit_rate: track.bit_rate,
      album_title: track.album_title,
      composer: track.composer,
      artwork_count: track.artwork_count,
      play_count: track.play_count,
      play_date: SharedView.datetime_to_us_date(track.play_date)
    }
  end

  def render("track.json", %{track: track}) do
    %{
      id: track.id,
      itunes_id: track.itunes_id,
      title: track.title,
      artist_id: track.artist_id,
      genre_id: track.genre_id,
      date_modified: track.date_modified,
      date_added: track.date_added,
      file_type: track.file_type,
      file_size: track.file_size,
      file_path: track.file_path,
      length: track.length,
      bit_rate: track.bit_rate,
      sample_rate: track.sample_rate,
      track_number: track.track_number,
      relase_year: track.relase_year,
      album_title: track.album_title,
      album_disc_number: track.album_disc_number,
      album_disc_count: track.album_disc_count,
      album_artist: track.album_artist,
      album_track_count: track.album_track_count,
      composer: track.composer,
      artwork_count: track.artwork_count,
      play_count: track.play_count,
      play_date: track.play_date
    }
  end
end
