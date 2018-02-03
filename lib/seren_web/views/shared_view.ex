defmodule SerenWeb.SharedView do
  use SerenWeb, :view

  def datetime_to_us_date(nil) do
  	nil
  end

  def datetime_to_us_date(datetime) do
  	"#{datetime.month}/#{datetime.day}/#{datetime.year}"
  end
end
