defmodule Seren.Player.Track do
  use Ecto.Schema
  import Ecto.Changeset
  alias Seren.Player.Track


  schema "tracks" do
    field :album_artist, :string
    field :album_disc_count, :integer
    field :album_disc_number, :integer
    field :album_title, :string
    field :album_track_count, :integer
    field :artwork_count, :integer
    field :bit_rate, :integer
    field :composer, :string
    field :date_added, :utc_datetime
    field :date_modified, :utc_datetime
    field :file_path, :string
    field :file_size, :integer
    field :file_type, :string
    field :genre, :string
    field :itunes_id, :integer
    field :length, :integer
    field :play_count, :integer
    field :play_date, :utc_datetime
    field :relase_year, :integer
    field :sample_rate, :integer
    field :title, :string
    field :track_number, :integer

    timestamps()

    belongs_to :artist, Seren.Player.Artist
  end

  @doc false
  def changeset(%Track{} = track, attrs) do
    track
    |> cast(attrs, [:itunes_id, :title, :genre, :date_modified, :date_added, :file_type, :file_size, :file_path, :length, :bit_rate, :sample_rate, :track_number, :relase_year, :album_title, :album_disc_number, :album_disc_count, :album_artist, :album_track_count, :composer, :artwork_count, :play_count, :play_date, :artist_id])
    |> validate_required([:itunes_id, :title, :genre, :date_modified, :date_added, :file_type, :file_size, :file_path, :length, :bit_rate, :sample_rate, :track_number, :relase_year, :album_title, :album_disc_number, :album_disc_count, :album_artist, :album_track_count, :composer, :artwork_count, :play_count, :play_date, :artist_id])
    |> foreign_key_constraint(:artist_id)
    |> assoc_constraint(:artist)
  end
end
