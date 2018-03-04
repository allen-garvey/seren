defmodule SerenWeb.Router do
  use SerenWeb, :router

  pipeline :browser do
    plug :accepts, ["html"]
    plug :fetch_session
    plug :fetch_flash
    plug :protect_from_forgery
    plug :put_secure_browser_headers
  end

  pipeline :api do
    plug :accepts, ["json"]
  end

  scope "/", SerenWeb do
    pipe_through :browser # Use the default browser stack

    get "/", PageController, :index
  end

  scope "/api", SerenWeb do
    pipe_through :api

    resources "/tracks", TrackController, only: [:index, :show]
    resources "/artists", ArtistController, only: [:index, :show]

    get "/artists/:id/tracks", ArtistController, :tracks_for
  end

end
