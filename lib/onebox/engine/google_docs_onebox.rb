module Onebox
  module Engine
    class GoogleDocsOnebox
      include Engine
      include LayoutSupport

      def self.supported_endpoints
        %w(spreadsheets document forms presentation)
      end

      def self.short_types
        @shorttypes ||= {
          spreadsheets: :sheets,
          document: :docs,
          presentation: :slides,
          forms: :forms,
        }
      end

      matches_regexp /^(https?:)?\/\/(docs\.google\.com)\/(?<endpoint>(#{supported_endpoints.join('|')}))\/d\/((?<key>[\w-]*)).+$/
      always_https

      protected

      def data
        og_data = get_og_data
        result = { link: link,
                   title: og_data[:title],
                   description: og_data[:description],
                   type: shorttype
                 }
        result
      end

      def doc_type
        @doc_type ||= match[:endpoint].to_sym
      end

      def shorttype
        GoogleDocsOnebox.short_types[doc_type]
      end

      def match
        @match ||= @url.match(@@matcher)
      end

      def get_og_data
        response = Onebox::Helpers.fetch_response(url)
        html = Nokogiri::HTML(response.body)
        og_data = {}
        html.css('meta').each do |m|
          if m.attribute('property') && m.attribute('property').to_s.match(/^og:/i)
            m_content = m.attribute('content').to_s.strip
            m_property = m.attribute('property').to_s.gsub('og:', '')
            og_data[m_property.to_sym] = m_content
          end
        end
        og_data
      end
    end
  end
end
